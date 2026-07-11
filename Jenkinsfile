pipeline {
    agent any

    environment {
        // Load both secret files injected by Jenkins
        ENV_BACKEND = credentials('ENV_BACKEND')
        ENV_FRONTEND = credentials('ENV_FRONTEND')
    }

    stages {
        stage('Prepare Environment') {
            steps {
                script {
                    // Copy the secure .env files to their respective folders
                    if (isUnix()) {
                        sh 'cp $ENV_BACKEND ./backend/.env'
                        sh 'cp $ENV_FRONTEND ./frontend/.env'
                    } else {
                        bat 'copy "%ENV_BACKEND%" ".\\backend\\.env"'
                        bat 'copy "%ENV_FRONTEND%" ".\\frontend\\.env"'
                    }
                }
            }
        }
        
        stage('Front-end Pipeline') {
            steps {
                dir('frontend') {
                    script {
                        // Install dependencies and build docker image
                        if (isUnix()) {
                            sh 'npm install'
                            sh 'npm run build'
                            sh 'docker build -t realprojeeeeet-frontend .'
                        } else {
                            bat 'npm install'
                            bat 'npm run build'
                            bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" build -t realprojeeeeet-frontend .'
                        }
                    }
                }
            }
        }

        stage('Back-end Pipeline') {
            steps {
                dir('backend') {
                    script {
                        // Build backend docker image (Dependencies installed during docker build)
                        if (isUnix()) {
                            sh 'docker build -t realprojeeeeet-backend .'
                        } else {
                            bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" build -t realprojeeeeet-backend .'
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
                        bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" compose up -d'
                        bat 'echo "Agentic Orchestration initialized successfully."'
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Security Cleanup: Delete the .env files so they don't stay on the server
                if (isUnix()) {
                    sh 'rm -f ./backend/.env'
                    sh 'rm -f ./frontend/.env'
                } else {
                    bat 'if exist ".\\backend\\.env" del ".\\backend\\.env"'
                    bat 'if exist ".\\frontend\\.env" del ".\\frontend\\.env"'
                }
            }
        }
    }
}
