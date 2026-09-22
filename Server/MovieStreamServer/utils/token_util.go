package utils

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/aryanraj13/MovieStream/Server/MovieStreamServer/database"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type SignedDetails struct {
	Email     string
	FirstName string
	LastName  string
	Role      string
	UserId    string
	jwt.RegisteredClaims
}

// Read secrets when they are actually needed.
// This avoids the .env initialization-order problem.
func getSecretKey() (string, error) {
	secret := os.Getenv("SECRET_KEY")

	if secret == "" {
		return "", errors.New("SECRET_KEY is not configured")
	}

	return secret, nil
}

func getRefreshSecretKey() (string, error) {
	secret := os.Getenv("SECRET_REFRESH_KEY")

	if secret == "" {
		return "", errors.New("SECRET_REFRESH_KEY is not configured")
	}

	return secret, nil
}

func GenerateAllTokens(email, firstName, lastName, role, userId string) (string, string, error) {
	secretKey, err := getSecretKey()
	if err != nil {
		return "", "", err
	}

	refreshSecretKey, err := getRefreshSecretKey()
	if err != nil {
		return "", "", err
	}

	now := time.Now()

	claims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserId:    userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "MagicStream",
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", "", err
	}

	refreshClaims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserId:    userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "MagicStream",
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(7 * 24 * time.Hour)),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)

	signedRefreshToken, err := refreshToken.SignedString([]byte(refreshSecretKey))
	if err != nil {
		return "", "", err
	}

	return signedToken, signedRefreshToken, nil
}

func UpdateAllTokens(userId, token, refreshToken string, client *mongo.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	updateData := bson.M{
		"$set": bson.M{
			"token":         token,
			"refresh_token": refreshToken,
			"update_at":     time.Now(),
		},
	}

	userCollection := database.OpenCollection("users", client)

	_, err := userCollection.UpdateOne(
		ctx,
		bson.M{"user_id": userId},
		updateData,
	)

	return err
}

func GetAccessToken(c *gin.Context) (string, error) {
	tokenString, err := c.Cookie("access_token")
	if err != nil {
		return "", errors.New("access token cookie not found")
	}

	if tokenString == "" {
		return "", errors.New("access token is empty")
	}

	return tokenString, nil
}

func ValidateToken(tokenString string) (*SignedDetails, error) {
	secretKey, err := getSecretKey()
	if err != nil {
		return nil, err
	}

	claims := &SignedDetails{}

	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("invalid signing method")
			}

			return []byte(secretKey), nil
		},
	)

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid access token")
	}

	if claims.Issuer != "MagicStream" {
		return nil, errors.New("invalid token issuer")
	}

	if claims.ExpiresAt == nil {
		return nil, errors.New("token expiration is missing")
	}

	return claims, nil
}

func ValidateRefreshToken(tokenString string) (*SignedDetails, error) {
	refreshSecretKey, err := getRefreshSecretKey()
	if err != nil {
		return nil, err
	}

	claims := &SignedDetails{}

	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("invalid signing method")
			}

			return []byte(refreshSecretKey), nil
		},
	)

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid refresh token")
	}

	if claims.Issuer != "MagicStream" {
		return nil, errors.New("invalid token issuer")
	}

	if claims.ExpiresAt == nil {
		return nil, errors.New("refresh token expiration is missing")
	}

	return claims, nil
}

func GetUserIdFromContext(c *gin.Context) (string, error) {
	userId, exists := c.Get("userId")

	if !exists {
		return "", errors.New("userId does not exist in this context")
	}

	id, ok := userId.(string)
	if !ok {
		return "", errors.New("unable to retrieve userId")
	}

	return id, nil
}

func GetRoleFromContext(c *gin.Context) (string, error) {
	role, exists := c.Get("role")

	if !exists {
		return "", errors.New("role does not exist in this context")
	}

	memberRole, ok := role.(string)
	if !ok {
		return "", errors.New("unable to retrieve role")
	}

	return memberRole, nil
}
