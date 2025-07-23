export type IBookingFilters = {
  resource?: string;
  requestedBy?: string;
  date?: string;
};

export type SlotCheckParams = {
  resource: string;
  startTime: string;
  endTime: string;
};
