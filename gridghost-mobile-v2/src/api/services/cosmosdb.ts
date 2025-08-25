import { CosmosClient, Database, Container } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

export class CosmosDBService {
  private client: CosmosClient;
  private database: Database;
  private usersContainer: Container;
  private racesContainer: Container;
  private vehiclesContainer: Container;
  private groupsContainer: Container;
  private eventsContainer: Container;

  constructor(credential: DefaultAzureCredential) {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const databaseName = process.env.COSMOS_DB_DATABASE;

    if (!endpoint || !databaseName) {
      throw new Error('Cosmos DB configuration missing');
    }

    this.client = new CosmosClient({
      endpoint,
      aadCredentials: credential
    });

    this.database = this.client.database(databaseName);
    this.usersContainer = this.database.container('users');
    this.racesContainer = this.database.container('races');
    this.vehiclesContainer = this.database.container('vehicles');
    this.groupsContainer = this.database.container('groups');
    this.eventsContainer = this.database.container('events');
  }

  // User operations
  async createUser(user: any) {
    const { resource } = await this.usersContainer.items.create(user);
    return resource;
  }

  async getUserById(userId: string) {
    try {
      const { resource } = await this.usersContainer.item(userId, userId).read();
      return resource;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email }]
    };

    const { resources } = await this.usersContainer.items.query(querySpec).fetchAll();
    return resources[0] || null;
  }

  async updateUser(userId: string, updates: any) {
    const { resource } = await this.usersContainer.item(userId, userId).replace({
      ...updates,
      id: userId,
      updatedAt: new Date().toISOString()
    });
    return resource;
  }

  // Race operations
  async createRace(race: any) {
    const raceData = {
      ...race,
      id: race.id || `race_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource } = await this.racesContainer.items.create(raceData);
    return resource;
  }

  async getRaceById(raceId: string, userId: string) {
    try {
      const { resource } = await this.racesContainer.item(raceId, userId).read();
      return resource;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getUserRaces(userId: string, limit = 50) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@limit', value: limit }
      ]
    };

    const { resources } = await this.racesContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  async updateRace(raceId: string, userId: string, updates: any) {
    const { resource } = await this.racesContainer.item(raceId, userId).replace({
      ...updates,
      id: raceId,
      userId,
      updatedAt: new Date().toISOString()
    });
    return resource;
  }

  async getLiveRaces(radius: number = 10, latitude?: number, longitude?: number) {
    // For now, return active races - in production, implement geospatial queries
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.status = @status ORDER BY c.createdAt DESC',
      parameters: [{ name: '@status', value: 'active' }]
    };

    const { resources } = await this.racesContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  // Vehicle operations
  async createVehicle(vehicle: any) {
    const vehicleData = {
      ...vehicle,
      id: vehicle.id || `vehicle_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource } = await this.vehiclesContainer.items.create(vehicleData);
    return resource;
  }

  async getUserVehicles(userId: string) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@userId', value: userId }]
    };

    const { resources } = await this.vehiclesContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  async getVehicleById(vehicleId: string, userId: string) {
    try {
      const { resource } = await this.vehiclesContainer.item(vehicleId, userId).read();
      return resource;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateVehicle(vehicleId: string, userId: string, updates: any) {
    const { resource } = await this.vehiclesContainer.item(vehicleId, userId).replace({
      ...updates,
      id: vehicleId,
      userId,
      updatedAt: new Date().toISOString()
    });
    return resource;
  }

  async deleteVehicle(vehicleId: string, userId: string) {
    await this.vehiclesContainer.item(vehicleId, userId).delete();
    return true;
  }

  // Group operations
  async createGroup(groupData: any) {
    const group = {
      ...groupData,
      id: groupData.id || `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource } = await this.groupsContainer.items.create(group);
    return resource;
  }

  async getGroupById(groupId: string) {
    try {
      const { resource } = await this.groupsContainer.item(groupId, groupId).read();
      return resource;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getUserGroups(userId: string) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, {"userId": @userId}, true)',
      parameters: [{ name: '@userId', value: userId }]
    };

    const { resources } = await this.groupsContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  async searchGroups(options: { query?: string; category?: string; limit: number }) {
    let sqlQuery = 'SELECT * FROM c WHERE c.privacy = "public"';
    const parameters: any[] = [];

    if (options.query) {
      sqlQuery += ' AND (CONTAINS(UPPER(c.name), UPPER(@query)) OR CONTAINS(UPPER(c.description), UPPER(@query)))';
      parameters.push({ name: '@query', value: options.query });
    }

    if (options.category) {
      sqlQuery += ' AND c.category = @category';
      parameters.push({ name: '@category', value: options.category });
    }

    sqlQuery += ' ORDER BY c.stats.totalMembers DESC';
    sqlQuery += ` OFFSET 0 LIMIT ${options.limit}`;

    const querySpec = {
      query: sqlQuery,
      parameters
    };

    const { resources } = await this.groupsContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  async updateGroup(groupId: string, groupData: any) {
    const { resource } = await this.groupsContainer.item(groupId, groupId).replace({
      ...groupData,
      id: groupId,
      updatedAt: new Date().toISOString()
    });
    return resource;
  }

  // Event operations
  async getGroupEvents(groupId: string) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.groupId = @groupId ORDER BY c.dateTime ASC',
      parameters: [{ name: '@groupId', value: groupId }]
    };

    const { resources } = await this.eventsContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  async createGroupEvent(eventData: any) {
    const event = {
      ...eventData,
      id: eventData.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource } = await this.eventsContainer.items.create(event);
    return resource;
  }
}