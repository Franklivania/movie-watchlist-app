import type { DetailsByID, MovieSearchResult } from "@/service/omdb-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type WatchList = {
  imdbID: string;
  addedAt: number;
  details?: DetailsByID;
  searchSnapshot?: MovieSearchResult;
};

export type WatchListInput = {
  imdbID: string;
  addedAt?: number;
  details?: DetailsByID;
  searchSnapshot?: MovieSearchResult;
};

type WatchlistState = {
  ids: string[];
  byId: Record<string, WatchList>;
  has: (imdbID: string) => boolean;
  addOrUpdate: (item: WatchListInput) => void;
  remove: (imdbID: string) => void;
  toggle: (imdbID: string, item?: Omit<WatchList, "imdbID" | "addedAt"> & Partial<Pick<WatchList, "addedAt">>) => boolean;
  clear: () => void;
};

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      byId: {},

      has: (imdbID) => !!get().byId[imdbID],

      addOrUpdate: (item) =>
        set((state) => {
          const exists = !!state.byId[item.imdbID];
          const merged: WatchList = {
            ...(exists ? state.byId[item.imdbID] : undefined),
            ...(item as Omit<WatchList, "addedAt">),
            imdbID: item.imdbID,
            addedAt: item.addedAt ?? (exists ? state.byId[item.imdbID].addedAt : Date.now()),
          };
          return {
            ids: exists ? state.ids : [item.imdbID, ...state.ids],
            byId: { ...state.byId, [item.imdbID]: merged },
          };
        }),

      remove: (imdbID) =>
        set((state) => {
          if (!state.byId[imdbID]) return state;
          const { [imdbID]: _removed, ...rest } = state.byId;
          return { ids: state.ids.filter((id) => id !== imdbID), byId: rest };
        }),

      // Returns next state: true if added, false if removed
      toggle: (imdbID, item) => {
        const exists = get().has(imdbID);
        if (exists) {
          get().remove(imdbID);
          return false;
        }
        get().addOrUpdate({
          imdbID,
          addedAt: item?.addedAt ?? Date.now(),
          details: item?.details,
          searchSnapshot: item?.searchSnapshot,
        });
        return true;
      },

      clear: () => set({ ids: [], byId: {} }),
    }),
    {
      name: "Yjc6L/441GQ=-wishlist-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({ ids: state.ids, byId: state.byId }),
    }
  )
);


