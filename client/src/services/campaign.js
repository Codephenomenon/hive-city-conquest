import { db } from '@/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Save a campaign
async function saveCampaign(campaign) {
  const auth = getAuth()
  if (!auth.currentUser) return null;
  
  try {
    // If campaign has an id, update it
    if (campaign.id) {
      const campaignRef = doc(db, "campaigns", campaign.id)
      await updateDoc(campaignRef, {
        name: campaign.name,
        data: campaign.data,
        updatedAt: new Date()
      })
      return campaign.id;
    } 
    // Otherwise create a new one
    else {
      const docRef = await addDoc(collection(db, "campaigns"), {
        userId: auth.currentUser.uid,
        name: campaign.name,
        data: campaign,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return docRef.id;
    }
  } catch (e) {
    console.error("Error saving campaign: ", e);
    return null;
  }
}

// Get all campaigns for current user
async function getUserCampaigns() {
  const auth = getAuth()
  if (!auth.currentUser) return []
  
  try {
    const q = query(
      collection(db, "campaigns"), 
      where("userId", "==", auth.currentUser.uid)
    )
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    
    querySnapshot.forEach((doc) => {
      campaigns.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return campaigns
  } catch (e) {
    console.error("Error getting campaigns: ", e);
    return [];
  }
}
