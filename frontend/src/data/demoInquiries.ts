import type { Inquiry } from '../services/inquiries';

const IMG_BOLE =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80';
const IMG_HAWASSA =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

/** Demo IDs — must match reply `sender._id` logic in Inquiries.tsx */
export const DEMO_OWNER_ID = 'demo-user-owner';
export const DEMO_RENTER_ID = 'demo-user-renter';

export const DEMO_INQUIRIES: Inquiry[] = [
  {
    _id: 'demo-inq-bole',
    property: {
      _id: 'demo-addis-bole-1',
      title: 'Modern 2BR apartment in Bole',
      images: [{ url: IMG_BOLE, isMain: true }],
      location: { city: 'Addis Ababa', area: 'Bole' },
      pricing: { pricePerMonth: 48000 },
    },
    renter: { _id: DEMO_RENTER_ID, fullName: 'Nile K.', email: 'nile@example.com' },
    owner: { _id: DEMO_OWNER_ID, fullName: 'Alemayehu Bekele', email: 'alem@example.com' },
    message:
      'Hello — is this apartment still available for February? I would like to schedule a viewing near Bole airport.',
    status: 'Responded',
    replies: [
      {
        _id: 'demo-r1',
        sender: { _id: DEMO_OWNER_ID, fullName: 'Alemayehu Bekele' },
        message:
          'Yes, it is available. I can show you this Saturday at 10:00 AM at the building gate. Please bring an ID.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: 'demo-r2',
        sender: { _id: DEMO_RENTER_ID, fullName: 'Nile K.' },
        message: 'Saturday works perfectly. I will be there at 10. Thank you!',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
    ],
    renterLastReadAt: new Date().toISOString(),
    ownerLastReadAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-inq-hawassa',
    property: {
      _id: 'demo-hawassa-1',
      title: 'Family house with garden — Hawassa',
      images: [{ url: IMG_HAWASSA, isMain: true }],
      location: { city: 'Hawassa', area: 'Tabor' },
      pricing: { pricePerMonth: 35000 },
    },
    renter: { _id: DEMO_RENTER_ID, fullName: 'Nile K.', email: 'nile@example.com' },
    owner: { _id: 'demo-user-owner-2', fullName: 'Sara Hailu', email: 'sara@example.com' },
    message: 'Does the house include water tank and parking? We have two cars.',
    status: 'Responded',
    replies: [
      {
        _id: 'demo-r3',
        sender: { _id: 'demo-user-owner-2', fullName: 'Sara Hailu' },
        message:
          'Yes — 5,000 L tank and covered parking for two cars. Utilities are separate as noted in the listing.',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    renterLastReadAt: new Date(Date.now() - 3600000).toISOString(),
    ownerLastReadAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function isDemoInquiryId(id: string): boolean {
  return id.startsWith('demo-inq-');
}
