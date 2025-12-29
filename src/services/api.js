import { supabase } from './supabase';

// Helper function to convert numeric age to age bracket
const getAgeBracket = (age) => {
  if (!age) return 'Adult'; // Default for null ages
  const numAge = parseInt(age);
  if (numAge >= 0 && numAge <= 3) return 'Toddler';
  if (numAge >= 4 && numAge <= 12) return 'Kid';
  if (numAge >= 13 && numAge <= 20) return 'Youth';
  if (numAge >= 21) return 'Adult';
  return 'Adult';
};

// Fetch all people with their shirt and registration info
export const fetchAllPeople = async () => {
  try {
    const { data, error } = await supabase
      .from('people')
      .select(`
        *,
        shirts(*),
        registrations(*)
      `);

    if (error) throw error;

    // Transform the data to match our app structure
    const transformed = data.map(person => ({
      id: person.id,
      firstName: person.first_name,
      lastName: person.last_name,
      age: person.age,
      ageBracket: getAgeBracket(person.age),
      location: person.location === 'GUEST' ? 'Guest' : person.location,
      contactNumber: person.contact_number,
      registered: person.registrations?.[0]?.registered || false,
      registeredAt: person.registrations?.[0]?.registered_at || null,
      shirtSize: person.shirts?.[0]?.shirt_size || '',
      paid: person.shirts?.[0]?.paid || false,
      shirtGiven: person.shirts?.[0]?.shirt_given || false,
    }));

    return transformed;
  } catch (error) {
    console.error('Error fetching people:', error);
    return [];
  }
};

// Check in a person (add/update registration)
export const checkInPerson = async (personId) => {
  try {
    // Check if registration already exists
    const { data: existing } = await supabase
      .from('registrations')
      .select('*')
      .eq('person_id', personId)
      .single();

    if (existing) {
      // Update existing registration
      const { error } = await supabase
        .from('registrations')
        .update({
          registered: true,
          registered_at: new Date().toISOString()
        })
        .eq('person_id', personId);

      if (error) throw error;
    } else {
      // Insert new registration
      const { error } = await supabase
        .from('registrations')
        .insert({
          person_id: personId,
          registered: true,
          registered_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error checking in person:', error);
    return false;
  }
};

// Remove check-in (set registered to false)
export const removeCheckIn = async (personId) => {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({
        registered: false,
        registered_at: null
      })
      .eq('person_id', personId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing check-in:', error);
    return false;
  }
};

// Update shirt size
export const updateShirtSize = async (personId, size) => {
  try {
    // Check if shirt record exists
    const { data: existing } = await supabase
      .from('shirts')
      .select('*')
      .eq('person_id', personId)
      .single();

    if (existing) {
      // Update existing shirt
      const { error } = await supabase
        .from('shirts')
        .update({ shirt_size: size })
        .eq('person_id', personId);

      if (error) throw error;
    } else {
      // Insert new shirt record
      const { error } = await supabase
        .from('shirts')
        .insert({
          person_id: personId,
          shirt_size: size,
          paid: false,
          shirt_given: false
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating shirt size:', error);
    return false;
  }
};

// Toggle shirt payment status
export const toggleShirtPayment = async (personId, currentPaid) => {
  try {
    const { error } = await supabase
      .from('shirts')
      .update({ paid: !currentPaid })
      .eq('person_id', personId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling payment:', error);
    return false;
  }
};

// Toggle shirt given status
export const toggleShirtGiven = async (personId, currentGiven) => {
  try {
    const { error } = await supabase
      .from('shirts')
      .update({ shirt_given: !currentGiven })
      .eq('person_id', personId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling shirt given:', error);
    return false;
  }
};