#!/bin/bash

# This script runs the SonarScanner analysis for the project.

# Fail the script if any command fails.
set -e

# Define color codes.
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Set the root directory relative to this script.
ROOT_DIR=$(dirname "$(dirname "$0")")

# Load environment variables from either .env file or .env.local file located in the root directory.
for ENV_FILE in "$ROOT_DIR/.env" "$ROOT_DIR/.env.local"; do
  if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
  fi
done

# Check if necessary environment variables are set.
for VAR in SONAR_PROJECT_KEY SONAR_HOST_URL SONAR_TOKEN; do
  if [ -z "${!VAR}" ]; then
    echo -e "${RED}The $VAR environment variable is not set. Please set it in the .env file.${NC}"
    exit 1
  fi
done

# Ensure SONAR_TOKEN starts with "sqp_".
if [[ ! "$SONAR_TOKEN" =~ ^sqp_ ]]; then
  echo -e "${RED}The SONAR_TOKEN environment variable must start with 'sqp_'.${NC}"
  exit 1
fi

# Trim all leading and trailing whitespace from the environment variables.
SONAR_PROJECT_KEY=$(echo "$SONAR_PROJECT_KEY" | xargs)
SONAR_HOST_URL=$(echo "$SONAR_HOST_URL" | xargs | sed 's:/*$::')
SONAR_TOKEN=$(echo "$SONAR_TOKEN" | xargs)

# Function to check if SonarQube is running.
check_sonarqube_status() {
  echo -e "${YELLOW}Checking SonarQube status${NC}"
  curl -s "$SONAR_HOST_URL/api/system/status" | grep -q '"status":"UP"'
}

# Early check: Is SonarQube already running?
if check_sonarqube_status; then
  echo -e "${GREEN}SUCCESS!${NC}"
  echo -e "Starting SonarScanner analysis"
else
  # Check if Homebrew is installed.
  if ! command -v brew &> /dev/null; then
    echo -e "${RED}Homebrew is not installed. Please install it before running this script.${NC}"
    exit 1
  fi

  # Check if the SonarScanner is installed. If not, install it with Homebrew.
  if ! command -v sonar-scanner &> /dev/null; then
    echo -e "${YELLOW}The SonarScanner is not installed. Installing it with Homebrew...${NC}"
    brew update
    brew install sonar-scanner
  fi

  # Check if the SonarQube Docker container exists and is running.
  if docker ps -q -f name=sonarqube &> /dev/null; then
    echo -e "${GREEN}SonarQube Docker container is already running.${NC}"
  else
    if docker ps -aq -f name=sonarqube &> /dev/null; then
      echo -e "${YELLOW}SonarQube Docker container exists but is not running. Starting the container...${NC}"
      docker start sonarqube
    else
      echo -e "${YELLOW}SonarQube Docker container does not exist. Creating and starting a new container...${NC}"
      docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 4000:9000 sonarqube:latest
    fi
  fi

  # Wait for SonarQube to start up and reach the "UP" status.
  echo -e "${YELLOW}Checking if SonarQube is ready...${NC}"

  MAX_WAIT=300  # Maximum wait time in seconds (5 minutes)
  WAIT_INTERVAL=5  # Interval between checks
  elapsed_time=0

  until check_sonarqube_status; do
    if [ "$elapsed_time" -ge "$MAX_WAIT" ]; then
      echo -e "${RED}SonarQube did not reach 'UP' status within $(($MAX_WAIT / 60)) minutes.${NC}"
      echo -e "${RED}Please check the SonarQube logs for details.${NC}"
      exit 1
    fi
    printf "${YELLOW}Waiting for SonarQube to be ready... %d seconds elapsed.${NC}\n" "$elapsed_time"
    sleep "$WAIT_INTERVAL"
    elapsed_time=$((elapsed_time + WAIT_INTERVAL))
  done

  echo -e "${GREEN}SonarQube status: UP${NC}"
  echo -e "${GREEN}SonarQube is ready. Let's go!${NC}"
fi

# Run the SonarScanner analysis with the provided environment variables.
if sonar-scanner \
  -Dsonar.projectKey="$SONAR_PROJECT_KEY" \
  -Dsonar.sources="$ROOT_DIR" \
  -Dsonar.host.url="$SONAR_HOST_URL" \
  -Dsonar.token="$SONAR_TOKEN"; then
  echo -e "${GREEN}SonarScanner analysis completed successfully.${NC}"
  exit 0
else
  echo -e "${RED}Failed to run the SonarScanner analysis.${NC}"
  exit 1
fi
