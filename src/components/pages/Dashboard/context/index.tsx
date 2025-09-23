import React from "react";
import { IContextProvider, IDashboardProvider } from "./interface";
import { ISearchShelter, IShelter } from "../../../../interfaces/shelter";
import { listShelters } from "../../../../services/shelter.service";

export const DashboardContext = React.createContext<IDashboardProvider>(
  {} as IDashboardProvider
);

export function DashboardProvider({ children, initialShelters }: IContextProvider) {
  const page = React.useRef<number>(0);
  const filter = React.useRef<ISearchShelter>({});
  const limit = 12;

  const [shelters, setShelters] = React.useState<IShelter[]>(initialShelters || []);
  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [infinitScroll, setInfinitScroll] = React.useState<boolean>(true);
  
  const handleFilter = async (data: ISearchShelter) => {
    page.current = 0;
    filter.current = data;

    try {
      setRequesting(true);
      const resp = await listShelters({
        limit: limit,
        offset: page.current * limit,
        ...filter.current,
      });
      console.log(resp)
      const respData = resp.data;
      const respTotal = resp.total;      
      setShelters(respData);
      setInfinitScroll(respTotal > limit ? respData.length > 0 : false);
      page.current++;
    } catch (error) {
      console.error(error);
    } finally {
      setRequesting(false);
    }
  };
 
  return (
    <DashboardContext.Provider
      value={{ shelters, handleFilter, requesting, infinitScroll }}
    >
      {children}
    </DashboardContext.Provider>
  );
}


export const useDashboardContext = () => React.useContext(DashboardContext);