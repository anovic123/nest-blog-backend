export interface GetAllBlogsHelperResult {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchNameTerm?: string;
}

export const getAllBlogsHelper = (query: {
  [key: string]: string | undefined;
}) => {
  return {
    searchNameTerm: query.searchNameTerm ? query.searchNameTerm : undefined,
    sortBy: query.sortBy ? query.sortBy : 'createdAt',
    sortDirection:
      query.sortDirection !== undefined ? query.sortDirection : 'desc',
    pageNumber: query.pageNumber ? +query.pageNumber : 1,
    pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
  };
};
