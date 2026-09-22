package routes

import (
	controller "github.com/aryanraj13/MovieStream/Server/MovieStreamServer/controllers"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupUnProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	router.GET("/movies", controller.GetMovies(client))

	router.POST("/register", controller.RegisterUser(client))

	router.POST("/login", controller.LoginUser(client))

	// Refresh uses the refresh_token HTTP-only cookie.
	router.POST("/refresh", controller.RefreshTokenHandler(client))

	router.GET("/genres", controller.GetGenres(client))
}
