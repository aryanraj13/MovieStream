package controllers

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/aryanraj13/MovieStream/Server/MovieStreamServer/database"
	"github.com/aryanraj13/MovieStream/Server/MovieStreamServer/models"
	"github.com/aryanraj13/MovieStream/Server/MovieStreamServer/utils"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

func setAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	secure := os.Getenv("COOKIE_SECURE") == "true"

	sameSite := http.SameSiteLaxMode

	if os.Getenv("COOKIE_SAMESITE") == "none" {
		sameSite = http.SameSiteNoneMode
	}

	c.SetSameSite(sameSite)

	c.SetCookie(
		"access_token",
		accessToken,
		86400,
		"/",
		"",
		secure,
		true,
	)

	c.SetCookie(
		"refresh_token",
		refreshToken,
		604800,
		"/",
		"",
		secure,
		true,
	)
}

func clearAuthCookies(c *gin.Context) {
	secure := os.Getenv("COOKIE_SECURE") == "true"

	sameSite := http.SameSiteLaxMode

	if os.Getenv("COOKIE_SAMESITE") == "none" {
		sameSite = http.SameSiteNoneMode
	}

	c.SetSameSite(sameSite)

	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		"",
		secure,
		true,
	)

	c.SetCookie(
		"refresh_token",
		"",
		-1,
		"/",
		"",
		secure,
		true,
	)
}

func RegisterUser(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid input data",
			})
			return
		}

		validate := validator.New()

		if err := validate.Struct(user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Validation failed",
				"details": err.Error(),
			})
			return
		}

		hashedPassword, err := HashPassword(user.Password)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Unable to hash password",
			})
			return
		}

		ctx, cancel := context.WithTimeout(
			context.Background(),
			10*time.Second,
		)
		defer cancel()

		userCollection := database.OpenCollection("users", client)

		count, err := userCollection.CountDocuments(
			ctx,
			bson.M{"email": user.Email},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to check existing user",
			})
			return
		}

		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{
				"error": "User already exists",
			})
			return
		}

		user.UserID = bson.NewObjectID().Hex()
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		user.Password = hashedPassword

		result, err := userCollection.InsertOne(ctx, user)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create user",
			})
			return
		}

		c.JSON(http.StatusCreated, result)
	}
}

func LoginUser(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userLogin models.UserLogin

		if err := c.ShouldBindJSON(&userLogin); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid input data",
			})
			return
		}

		ctx, cancel := context.WithTimeout(
			context.Background(),
			10*time.Second,
		)
		defer cancel()

		var foundUser models.User

		userCollection := database.OpenCollection("users", client)

		err := userCollection.FindOne(
			ctx,
			bson.M{"email": userLogin.Email},
		).Decode(&foundUser)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid email or password",
			})
			return
		}

		err = bcrypt.CompareHashAndPassword(
			[]byte(foundUser.Password),
			[]byte(userLogin.Password),
		)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid email or password",
			})
			return
		}

		token, refreshToken, err := utils.GenerateAllTokens(
			foundUser.Email,
			foundUser.FirstName,
			foundUser.LastName,
			foundUser.Role,
			foundUser.UserID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate tokens",
			})
			return
		}

		err = utils.UpdateAllTokens(
			foundUser.UserID,
			token,
			refreshToken,
			client,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update tokens",
			})
			return
		}

		// Tokens are stored in HTTP-only cookies.
		// They are NOT returned to React.
		setAuthCookies(c, token, refreshToken)

		c.JSON(http.StatusOK, models.UserResponse{
			UserId:          foundUser.UserID,
			FirstName:       foundUser.FirstName,
			LastName:        foundUser.LastName,
			Email:           foundUser.Email,
			Role:            foundUser.Role,
			FavouriteGenres: foundUser.FavouriteGenres,
		})
	}
}

func LogoutHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := utils.GetUserIdFromContext(c)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		err = utils.UpdateAllTokens(
			userID,
			"",
			"",
			client,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error logging out",
			})
			return
		}

		clearAuthCookies(c)

		c.JSON(http.StatusOK, gin.H{
			"message": "Logged out successfully",
		})
	}
}

func RefreshTokenHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(
			context.Background(),
			10*time.Second,
		)
		defer cancel()

		refreshToken, err := c.Cookie("refresh_token")

		if err != nil || refreshToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Refresh token not found",
			})
			return
		}

		claims, err := utils.ValidateRefreshToken(refreshToken)

		if err != nil || claims == nil {
			clearAuthCookies(c)

			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired refresh token",
			})
			return
		}

		userCollection := database.OpenCollection("users", client)

		var user models.User

		err = userCollection.FindOne(
			ctx,
			bson.M{"user_id": claims.UserId},
		).Decode(&user)

		if err != nil {
			clearAuthCookies(c)

			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User not found",
			})
			return
		}

		// Make sure the refresh token is still the currently
		// stored token for this user.
		if user.RefreshToken != refreshToken {
			clearAuthCookies(c)

			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Refresh token has been revoked",
			})
			return
		}

		newToken, newRefreshToken, err := utils.GenerateAllTokens(
			user.Email,
			user.FirstName,
			user.LastName,
			user.Role,
			user.UserID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate new tokens",
			})
			return
		}

		err = utils.UpdateAllTokens(
			user.UserID,
			newToken,
			newRefreshToken,
			client,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error updating tokens",
			})
			return
		}

		setAuthCookies(c, newToken, newRefreshToken)

		c.JSON(http.StatusOK, gin.H{
			"message": "Tokens refreshed successfully",
		})
	}
}
