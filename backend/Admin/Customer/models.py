from django.db import models


class Clients(models.Model):
    name = models.CharField(max_length=255, blank=False, null=False)
    address = models.CharField(max_length=255, blank=False, null=False)
    province = models.CharField(max_length=255, blank=False, null=False)
    phoneNumber = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.name
