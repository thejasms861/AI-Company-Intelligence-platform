pipeline {
    agent any

    environment {
        // Load the secret file injected by Jenkins step 7
        ENV_FILE = credentials('ENV')
    }

    stages {
        stage('Prepare Environment') {
            steps {
                script {
                    // Copy the secure .env file to the backend
                    if (isUnix()) {
                        sh 'cp $ENV_FILE ./Lang/.env'
                    } else {
                        bat 'copy "%ENV_FILE%" ".\\Lang\\.env"'
                    }
                }
            }
        }
        
        stage('Front-end Pipeline') {
            steps {
                dir('campus-compass-main/campus-compass-main') {
                    script {
                        // Install dependencies and build docker image
                        if (isUnix()) {
                            sh 'npm install'
                            sh 'npm run build'
                            sh 'docker build -t realprojeeeeet-frontend .'
                        } else {
                            bat 'npm install'
                            bat 'npm run build'
                            bat 'docker build -t realprojeeeeet-frontend .'
                        }
                    }
                }
            }
        }

        stage('Back-end Pipeline') {
            steps {
                dir('Lang') {
                    script {
                        // Build backend docker image (Dependencies installed during docker build)
                        if (isUnix()) {
                            sh 'docker build -t realprojeeeeet-backend .'
                        } else {
                            bat 'docker build -t realprojeeeeet-backend .'
                        }
                    }
                }
            }
        }

        stage('Agentic Orchestration Pipeline') {
            steps {
                script {
                    // Start the full stack using Docker Compose
                    if (isUnix()) {
                        sh 'docker compose up -d'
                        sh 'echo "Agentic Orchestration initialized successfully."'
                    } else {
                        bat 'docker compose up -d'
                        bat 'echo "Agentic Orchestration initialized successfully."'
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Security Cleanup: Delete the .env file so it doesn't stay on the server
                if (isUnix()) {
                    sh 'rm -f ./Lang/.env'
                } else {
                    bat 'if exist ".\\Lang\\.env" del ".\\Lang\\.env"'
                }
            }
        }
    }
}
