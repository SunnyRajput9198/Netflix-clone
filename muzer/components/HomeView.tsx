"use client";
import { toast } from "sonner";
import Appbar from "@/components/Appbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState, useCallback } from "react";
import CardSkeleton from "@/components/ui/cardskeleton";
import SpacesCard from "./SpaceCard";

interface Space {
  endTime?: Date | null;
  hostId: string;
  id: string;
  isActive: boolean;
  name: string;
  startTime: Date | null;
}
//This code defines a React component named HomeView, likely for a web app where users can create, view, and delete "Spaces"
export default function HomeView() {
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);//isCreateSpaceOpen: A boolean state that controls the visibility of the create space dialog.
  const [spaceName, setSpaceName] = useState("");//spaceName: The name of the space.
  const [spaces, setSpaces] = useState<Space[] | null>(null);//spaces: An array of Space objects, each representing a space.
  const [loading, setIsLoading] = useState(false);//loading: A boolean state that indicates whether the spaces are being loaded.

  // Sends a GET request to /api/spaces and updates the spaces state.
  useEffect(() => {
    const fetchSpaces = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/spaces", {
          method: "GET",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch spaces");
        }

        const fetchedSpaces: Space[] = data.spaces;
        setSpaces(fetchedSpaces);
      } catch (error) {
        toast.error("Error fetching spaces");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpaces();
  }, []);

  //Sends a POST request with spaceName, updates the UI and shows a toast.
  const handleCreateSpace = async () => {
    setIsCreateSpaceOpen(false);
    try {
      const response = await fetch(`/api/spaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spaceName: spaceName,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create space");
      }

      const newSpace = data.space;
      setSpaces((prev) => {
        const updatedSpaces: Space[] = prev ? [...prev, newSpace] : [newSpace];
        return updatedSpaces;
      });
      toast.success(data.message);
    }
    //@ts-nocheck
    catch (error: any) {
      toast.error(error.message || "Error Creating Space");
    }
  };
  // Deletes a space using a DELETE request with the spaceId query param.
  const handleDeleteSpace = useCallback(async (spaceId: string) => {
    try {
      const response = await fetch(`/api/spaces/?spaceId=${spaceId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete space");
      }
      setSpaces((prev) => {
        const updatedSpaces: Space[] = prev
          ? prev.filter((space) => space.id !== spaceId)
          : [];
        return updatedSpaces;
      });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message || "Error Deleting Space");
    }
  }, [setSpaces, toast]); // Add dependencies if needed

  //ses useMemo to optimize rendering.
  // Shows skeleton cards when loading.
  // Shows SpacesCard components when data is ready.
  const renderSpaces = useMemo(() => {
    if (loading) {
      return (
        <>
          <div className="dark mx-auto h-[500px] w-full py-4 sm:w-[450px] lg:w-[500px]">
            <CardSkeleton />
          </div>
          <div className="dark mx-auto h-[500px] w-full py-4 sm:w-[450px] lg:w-[500px]">
            <CardSkeleton />
          </div>
        </>
      );
    }

    if (spaces && spaces.length > 0) {
      return spaces.map((space) => (
        <SpacesCard
          key={space.id}
          space={space}
          handleDeleteSpace={handleDeleteSpace}
        />
      ));
    }
  }, [loading, spaces, handleDeleteSpace]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-black text-gray-200">
      <Appbar />
      <div className="flex flex-grow flex-col items-center px-4 py-8">
        <div className="h-36 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-900 bg-clip-text text-9xl font-bold text-transparent">
          Spaces
        </div>
        <Button
          onClick={() => {
            setIsCreateSpaceOpen(true);
          }}
          className="mt-10 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          Create a new Space
        </Button>

        <div className="mt-20 grid grid-cols-1 gap-8 p-4 md:grid-cols-2">
          {renderSpaces}
        </div>
      </div>
      <Dialog open={isCreateSpaceOpen} onOpenChange={setIsCreateSpaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-10 text-center">
              Create new space
            </DialogTitle>
            <fieldset className="Fieldset">
              <label
                className="text-violet11 w-[90px] text-right text-xl font-bold"
                htmlFor="name"
              >
                Name of the Space
              </label>
              <input
                className="text-violet11 shadow-violet7 focus:shadow-violet8 mt-5 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                id="name"
                defaultValue="Pedro Duarte"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSpaceName(e.target.value);
                }}
              />
            </fieldset>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateSpaceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSpace}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Create Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}