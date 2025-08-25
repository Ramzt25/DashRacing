targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Resource group name')
param resourceGroupName string = 'rg-${environmentName}'

@description('JWT Secret for authentication')
param jwtSecret string

@description('Allowed origins for CORS')
param allowedOrigins string = '*'

// Generate unique resource token
var resourceToken = uniqueString(subscription().id, location, environmentName)
var resourcePrefix = 'dsh' // DASH shortened to 3 chars

// Create resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Deploy resources to the resource group
module resources 'resources.bicep' = {
  name: 'resources'
  scope: resourceGroup
  params: {
    environmentName: environmentName
    location: location
    resourceToken: resourceToken
    resourcePrefix: resourcePrefix
    jwtSecret: jwtSecret
    allowedOrigins: allowedOrigins
  }
}

// Outputs
output RESOURCE_GROUP_ID string = resourceGroup.id
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.AZURE_CONTAINER_REGISTRY_ENDPOINT
output COSMOS_DB_ENDPOINT string = resources.outputs.COSMOS_DB_ENDPOINT
output COSMOS_DB_DATABASE string = resources.outputs.COSMOS_DB_DATABASE
output SIGNALR_CONNECTION_STRING string = resources.outputs.SIGNALR_CONNECTION_STRING
output STORAGE_ACCOUNT_ENDPOINT string = resources.outputs.STORAGE_ACCOUNT_ENDPOINT
output APPLICATIONINSIGHTS_CONNECTION_STRING string = resources.outputs.APPLICATIONINSIGHTS_CONNECTION_STRING
output CONTAINER_APP_ENDPOINT string = resources.outputs.CONTAINER_APP_ENDPOINT
output KEYVAULT_ENDPOINT string = resources.outputs.KEYVAULT_ENDPOINT