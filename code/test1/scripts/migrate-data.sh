#!/bin/bash

# Data migration script from Atlas to local MongoDB
echo "MongoDB Data Migration Script"
echo "This script helps migrate data from MongoDB Atlas to local MongoDB"

# Configuration
ATLAS_URI="mongodb+srv://aviral:dassProject123@cluster0.dk3s4.mongodb.net/project_test"
LOCAL_URI="mongodb://localhost:27017/project_test"
BACKUP_DIR="./mongodb-backup"

echo "Select migration option:"
echo "1. Export data from Atlas"
echo "2. Import data to local MongoDB"
echo "3. Full migration (export + import)"
read -p "Enter choice (1-3): " choice

case $choice in
    1|3)
        echo "Exporting data from Atlas..."
        mkdir -p $BACKUP_DIR
        mongodump --uri="$ATLAS_URI" --out="$BACKUP_DIR"
        echo "Data exported to $BACKUP_DIR"
        
        if [ "$choice" == "1" ]; then
            exit 0
        fi
        ;;
esac

case $choice in
    2|3)
        echo "Importing data to local MongoDB..."
        if [ ! -d "$BACKUP_DIR" ]; then
            echo "Backup directory not found. Please export data first."
            exit 1
        fi
        
        # Check if local MongoDB is running
        if ! mongosh --eval "db.runCommand('ping')" localhost:27017/test > /dev/null 2>&1; then
            echo "Local MongoDB is not running. Please start it first."
            exit 1
        fi
        
        mongorestore --uri="$LOCAL_URI" "$BACKUP_DIR/project_test"
        echo "Data imported to local MongoDB"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo "Migration completed successfully!"
