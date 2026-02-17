"""
URL routing for Quiz Application API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"quizzes", views.QuizViewSet, basename="quiz")
router.register(r"questions", views.QuestionViewSet, basename="question")
router.register(r"attempts", views.QuizAttemptViewSet, basename="attempt")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "leaderboard/", views.GlobalLeaderboardView.as_view(), name="global-leaderboard"
    ),
    path("stats/", views.UserStatsView.as_view(), name="user-stats"),
]
