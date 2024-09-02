export interface District {
    id: string;
    owner: string;
    tokenId: string;
    x: number;
    y: number;
    metadataUrl: string;
    districtName: string;
    lastUpdate: string;
    stateHash: string | null;
  }