import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export function usePatientCreator(userId: string) {
  const [creatorEmail, setCreatorEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCreatorEmail() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use RPC call to get_user_email function
        const { data, error } = await supabase
          .rpc('get_user_email', { user_id: userId });

        if (isMounted) {
          if (error) {
            console.error('Error fetching creator email:', error);
            setCreatorEmail('Unknown');
          } else {
            setCreatorEmail(data || 'Unknown');
          }
        }
      } catch (error) {
        console.error('Error in fetchCreatorEmail:', error);
        if (isMounted) {
          setCreatorEmail('Unknown');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCreatorEmail();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { creatorEmail, loading };
}