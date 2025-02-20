#!/bin/bash

# Use to copy local Tone.js build into node_modules/tone/build

# Path to your custom Tone.js build folder
SOURCE_BUILD="./build"

# Path to node_modules tone build folder
DEST_BUILD="../dai/node_modules/tone/build"

# Check if source exists
if [ ! -d "$SOURCE_BUILD" ]; then
    echo "Error: Source build directory not found at $SOURCE_BUILD"
    exit 1
fi

# Check if destination exists
if [ ! -d "$DEST_BUILD" ]; then
    echo "Error: Destination directory not found at $DEST_BUILD"
    exit 1
fi

# Remove old build
rm -rf "$DEST_BUILD"/*

# Copy new build
cp -r "$SOURCE_BUILD"/* "$DEST_BUILD"

echo "✅ Successfully updated Tone.js build"