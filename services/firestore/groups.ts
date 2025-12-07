
// NOTE: Replace 'firebase/firestore' with your actual Firebase/DB package path
import { 
    getFirestore,
    collection, 
    doc, 
    getDoc,
    setDoc,
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc,
    arrayUnion,
    arrayRemove 
} from 'firebase/firestore'; 
import type { GroupBasecampData as Group, GroupBasecampData } from '~~/types/group'; 

const getGroupsCollection = () => collection(getFirestore(), 'groups');


const generateMockGroup = (id: string, name: string, isBig: boolean = false): GroupBasecampData => {
    const initials = name.split(' ').map(n => n[0]).join('');
    const memberCount = isBig ? 342 : 120;
    
    // NOTE: We MUST ensure all base Organization fields are included (ein, admins, propublica, etc.)
    return {
        // Base Organization Fields
        id: id,
        ein: null,
        admins: ['user-101'],
        name: name,
        propublica: false,
        type: "NeighborhoodGroup",
        description: `We are the dedicated team keeping the ${name.split(' ')[0]} area clean and organized. Join us for our weekly activities!`,
        contactEmail: `${name.replace(/\s/g, '').toLowerCase()}@community.org`,
        socialLinks: { facebook: `#${name}`, instagram: null },
        interests: ['Environment', 'Community', 'Social'],

        // Group Detail Fields (for UI)
        location: isBig ? 'Downtown Metro Area' : 'Westside Neighborhood',
        bannerUrl: isBig
            ? 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80' 
            : 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        themeColor: isBig ? '#3b82f6' : '#10b981',
        tags: ['Cleanup', 'Local', 'Events'],
        stats: {
            totalHours: isBig ? 4520 : 2100,
            eventsCompleted: isBig ? 54 : 28,
        },
        members: Array.from({ length: memberCount }, (_, i) => ({
            id: `mem_${i}`,
            name: `Neighbor ${i}`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=member${i}`
        })),
        upcomingEvents: [], // Keep list empty for simplicity
        activityFeed: [],
    };
};

const MOCK_GROUPS: GroupBasecampData[] = [
    generateMockGroup('101', 'Downtown District Cleanup Crew', true),
    generateMockGroup('102', 'Westside Community Gardeners'),
    generateMockGroup('103', 'South Hill Neighborhood Watch'),
    generateMockGroup('104', 'Riverside Park Restoration'),
];

// --- Helper Functions (Adapt these to your specific needs) ---

// Helper to map a raw Firestore document snapshot to the clean Group interface
const mapDocToGroupBasecamp = (docSnap: any): Group => {
    // You must implement the mapping logic here, including nested data like members, events, etc.
    const data = docSnap.data();
    return {
        id: docSnap.id,
        // ... map the rest of the fields (name, description, members, etc.)
        name: data.name,
        description: data.description,
        type: data.type || 'NeighborhoodGroup',
        // Example of complex mapping (you'll need a separate service/query for detailed member data)
        members: data.memberUids?.map((uid: string) => ({ id: uid, name: '...', avatarUrl: '...' })) || [],
        // The remaining fields from your template (stats, upcomingEvents, feed)
        ...data 
    } as GroupBasecampData; // Use 'as Group' if you are confident in your mapping
};

/**
 * Inserts the mock group data directly into the 'groups' collection.
 * This is meant to be run once for database setup.
 */
export async function seedMockGroupsToFirestore(): Promise<void> {
    const db = getFirestore();

    const groupsCollection = collection(db, 'groups');
    console.log("Starting to seed mock group data...");

    for (const group of MOCK_GROUPS) {
        const docRef = doc(groupsCollection, String(group.id));
        // We use setDoc with the group.id to ensure the Firestore document ID 
        // matches the mock ID, making it easy to reference in tests.
        try {
            await setDoc( docRef, {
                // IMPORTANT: Only save the data fields, not any computed fields 
                // like 'initials' or client-side stat objects if they aren't stored.
                name: group.name,
                description: group.description,
                type: group.type,
                ein: group.ein,
                admins: group.admins,
                propublica: group.propublica,
                contactEmail: group.contactEmail,
                socialLinks: group.socialLinks,
                interests: group.interests,
                location: group.location,
                themeColor: group.themeColor,
                tags: group.tags,
                
                // Save basic members/stats, though in a real app these would be subcollections
                memberUids: group.members.map(m => m.id), 
                totalVolunteerHours: group.stats.totalHours, 
                eventsCompleted: group.stats.eventsCompleted,
                
                // Add any other necessary fields...
            });
            console.log(`Successfully seeded group: ${group.name} (${group.id})`);
        } catch (error) {
            console.error(`Failed to seed group ${group.name}:`, error);
        }
    }
    console.log("Mock group seeding complete.");
}


// --- The Core GroupService ---

export const GroupService = {

    /**
     * Creates a new Group document in the database.
     * @param groupData The data object containing name, description, etc.
     * @param adminId The ID of the user creating the group (will be the first admin).
     * @returns The complete Group object, including the new ID.
     */
    async createGroup(groupData: any, adminId: string): Promise<GroupBasecampData> {

        const newGroupData = {
            ...groupData,
            admins: [adminId], // Set the creator as the first admin
            members: [adminId], // Automatically join the creator
            createdAt: new Date(),
            // Ensure all base fields like type, ein, propublica are set here
            type: groupData.type || 'NeighborhoodGroup', 
        };

        const docRef = await addDoc(getGroupsCollection(), newGroupData);

        // Fetch the created document to get the complete data + generated ID
        const createdDoc = await getDoc(docRef); 
        
        // Map the data and return the full object
        return mapDocToGroupBasecamp(createdDoc) as GroupBasecampData; 
    },


    /**
     * Fetches the data for a single group by ID.
     */
    async getById(groupId: string): Promise<Group | null> {
        const db = getFirestore();
        
        const groupRef = doc(db, 'groups', groupId);
        const docSnap = await getDoc(groupRef);

        if (docSnap.exists()) {
            // and then run additional queries to get the detailed members, 
            // events, and feed (subcollections) if they aren't embedded.
            return mapDocToGroupBasecamp(docSnap);
        } else {
            console.warn(`No group found with ID: ${groupId}`);
            return null;
        }
    },

    /**
     * Fetches all local community groups.
     */
    async getAll(): Promise<Group[]> {
        const db = getFirestore();
        const groupsCollection = collection(db, 'groups');
        // Example query: filter to only include Group types
        const q = query(
            groupsCollection, 
            where('type', 'in', ['NeighborhoodGroup', 'School'])
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDocToGroupBasecamp);
    },

    /**
     * Adds a user to the group's members list.
     * NOTE: This will be called by an action in useAuthStore for persistence.
     */
    async joinGroup(groupId: string, userId: string): Promise<void> {
        const db = getFirestore();

        const groupRef = doc(db, 'groups', groupId);
        // Use arrayUnion to safely add the user ID to the 'memberUids' array in the database
        await updateDoc(groupRef, {
            memberUids: arrayUnion(userId)
        });
        // You would also need to update the user's profile document here or in the AuthService
    },

    /**
     * Removes a user from the group's members list.
     * NOTE: This will be called by an action in useAuthStore for persistence.
     */
    async leaveGroup(groupId: string, userId: string): Promise<void> {
        const db = getFirestore();

        const groupRef = doc(db, 'groups', groupId);
        // Use arrayRemove to safely take the user ID out of the 'memberUids' array
        await updateDoc(groupRef, {
            memberUids: arrayRemove(userId)
        });
    },

    // ... other methods like create, update, delete
};