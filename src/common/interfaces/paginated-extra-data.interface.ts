import { Paginated } from "nestjs-paginate";

export interface PaginatedWithExtraData<T> extends Paginated<T> {
  extraData: any;
}