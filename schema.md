# Schema

## Sample Data Structure
```json
{
  "@workouts": [
    {
      "id": "uuid-1",
      "date": "2025-11-28",
      "type": "Strength",
      "duration": 60,
      "notes": "Upper body workout.",
      "isRestDay": false
    }
  ],
  "@weeklyGoals": [
    {
      "weekStart": "2025-11-24",
      "targetMinutes": 150,
      "targetWorkouts": 4
    }
  ],
  "@customTypes": ["HIIT", "Pilates"],

  "@stepup_rest_days": ["2025-11-28","2025-11-29","2025-11-30"],
  
  "@stepup_user": {
    "name": "user-name", 
    "email": "user-email", 
    "password": "user-password"
    }
}
```
