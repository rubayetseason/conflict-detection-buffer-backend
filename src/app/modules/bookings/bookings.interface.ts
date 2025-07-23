export type IBookingFilters = {
  resource?: string;
  requestedBy?: string;
  startDate?: string;
  endDate?: string;
};

export type SlotCheckParams = {
  resource: string;
  startTime: string;
  endTime: string;
};
