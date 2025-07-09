import { IShelter, ISearchShelter } from "../../../../interfaces/shelter";

export interface IDashboardProvider {
  shelters: IShelter[];
  handleFilter: (data: ISearchShelter) => Promise<void>;
  requesting: boolean;
  infinitScroll: boolean;
}

export interface IContextProvider {
  children: React.ReactNode;
  initialShelters?: IShelter[];
}