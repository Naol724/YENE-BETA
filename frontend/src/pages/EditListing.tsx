import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';
import ListingWizard from '../components/owner/ListingWizard';

export default function EditListing() {
  const { id } = useParams();
  const [house, setHouse] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/houses/${id}`);
        if (!cancelled) setHouse(res.data.data);
      } catch {
        if (!cancelled) setError('Could not load listing');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-error mb-4">{error}</p>
        <Link to="/owner/listings" className="text-primary font-semibold">
          Back to listings
        </Link>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <p className="text-textSecondary text-sm">Loading listing…</p>
      </div>
    );
  }

  return <ListingWizard mode="edit" houseId={id} initialHouse={house} />;
}
