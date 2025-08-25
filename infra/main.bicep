// GridGhost Production Infrastructure
// Azure deployment with Container Apps, PostgreSQL, Storage, and Security
targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Name of the resource group. Default: rg-{environmentName}')
param resourceGroupName string = 'rg-${environmentName}'

// Application Configuration Parameters
@secure()
@description('JWT secret for authentication')
param jwtSecret string

@description('Node environment (production, staging)')
param nodeEnv string = 'production'

@description('WebSocket port for real-time racing features')
param websocketPort string = '8080'

@description('CORS origin for mobile app')
param corsOrigin string = '*'

@secure()
@description('Google Maps API key for location services')
param googleMapsApiKey string

@secure()
@description('Azure Maps API key for additional mapping services')
param azureMapsApiKey string

@description('Expo public Google Maps API key for mobile app')
param expoPublicGoogleMapsApiKey string

@description('Expo public Azure Maps API key for mobile app')
param expoPublicAzureMapsApiKey string

// Database Configuration
@description('PostgreSQL administrator login')
param databaseAdminLogin string = 'gridghost'

@secure()
@description('PostgreSQL administrator password')
param databaseAdminPassword string

@description('PostgreSQL server name')
param databaseServerName string = ''

@description('PostgreSQL database name')
param databaseName string = 'gridghost'

// Remove unused variable
var resourceToken = uniqueString(subscription().id, location, environmentName)
var resourcePrefix = 'gg' // GridGhost prefix (≤ 3 characters)

// Create resource group
resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: {
    'azd-env-name': environmentName
    project: 'GridGhost'
    environment: nodeEnv
  }
}

// Deploy main resources to resource group
module resources 'resources.bicep' = {
  scope: rg
  params: {
    location: location
    environmentName: environmentName
    resourceToken: resourceToken
    resourcePrefix: resourcePrefix
    jwtSecret: jwtSecret
    nodeEnv: nodeEnv
    websocketPort: websocketPort
    corsOrigin: corsOrigin
    googleMapsApiKey: googleMapsApiKey
    azureMapsApiKey: azureMapsApiKey
    expoPublicGoogleMapsApiKey: expoPublicGoogleMapsApiKey
    expoPublicAzureMapsApiKey: expoPublicAzureMapsApiKey
    databaseAdminLogin: databaseAdminLogin
    databaseAdminPassword: databaseAdminPassword
    databaseServerName: databaseServerName
    databaseName: databaseName
  }
}

// Outputs
output RESOURCE_GROUP_ID string = rg.id
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.AZURE_CONTAINER_REGISTRY_ENDPOINT
output AZURE_CONTAINER_REGISTRY_NAME string = resources.outputs.AZURE_CONTAINER_REGISTRY_NAME
output APPLICATIONINSIGHTS_CONNECTION_STRING string = resources.outputs.APPLICATIONINSIGHTS_CONNECTION_STRING
output DATABASE_URL string = resources.outputs.DATABASE_URL
output POSTGRES_HOST string = resources.outputs.POSTGRES_HOST
output POSTGRES_DB string = resources.outputs.POSTGRES_DB
output POSTGRES_USER string = resources.outputs.POSTGRES_USER
output AZURE_STORAGE_ACCOUNT_NAME string = resources.outputs.AZURE_STORAGE_ACCOUNT_NAME
output GRIDGHOST_API_URL string = resources.outputs.GRIDGHOST_API_URL
output GRIDGHOST_MOBILE_URL string = resources.outputs.GRIDGHOST_MOBILE_URL
output AZURE_KEY_VAULT_NAME string = resources.outputs.AZURE_KEY_VAULT_NAME
