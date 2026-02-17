"""
Signals for automatic leaderboard updates after quiz completion.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import QuizAttempt, LeaderboardEntry


@receiver(post_save, sender=QuizAttempt)
def update_leaderboard_on_completion(sender, instance, **kwargs):
    """
    Automatically update leaderboard when a quiz attempt is completed.
    """
    if instance.completed:
        LeaderboardEntry.update_from_attempt(instance)
