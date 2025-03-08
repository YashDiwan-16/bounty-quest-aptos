"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Task } from "@/types/challenge";
import { Skeleton } from "./ui/skeleton";

interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

const TaskContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(
    () => Number(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => searchParams.get("category") || "all"
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>(() => ({
    column: searchParams.get("sortBy") || "endTime",
    direction: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  }));

  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          ...(selectedCategory !== "all" && { category: selectedCategory }),
          sortBy: sortConfig.column,
          sortOrder: sortConfig.direction,
        });

        const response = await fetch(`/api/tasks/past?${params}`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [currentPage, selectedCategory, sortConfig]);

  const handleSort = (column: string) => {
    const newDirection =
      sortConfig.column === column && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ column, direction: newDirection });
    updateSearchParams({
      sortBy: column,
      sortOrder: newDirection,
    });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    updateSearchParams({
      category: value === "all" ? "" : value,
      page: "1",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams({ page: page.toString() });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.column !== column) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="w-[180px] h-10" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">
                <Skeleton className="h-4 w-8 mx-auto" />
              </TableHead>
              <TableHead className="w-[300px]">
                <Skeleton className="h-4 w-[250px]" />
              </TableHead>
              <TableHead className="w-[150px]">
                <Skeleton className="h-4 w-20 mx-auto" />
              </TableHead>
              <TableHead className="w-[150px]">
                <Skeleton className="h-4 w-24 mx-auto" />
              </TableHead>
              <TableHead className="w-[150px]">
                <Skeleton className="h-4 w-24 mx-auto" />
              </TableHead>
              <TableHead className="w-[120px]">
                <Skeleton className="h-4 w-24 mx-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(11)
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[250px]" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-8 w-24 mx-auto" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-end mb-4">
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="blockchain">Blockchain</SelectItem>
            <SelectItem value="memes">Memes</SelectItem>
            <SelectItem value="nfts">NFTs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">Sr. No</TableHead>
            <TableHead className="w-[300px]">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Title <SortIcon column="title" />
              </div>
            </TableHead>
            <TableHead className="w-[150px] text-center">Category</TableHead>
            <TableHead className="w-[150px] text-center">
              <div
                className="flex items-center justify-center cursor-pointer"
                onClick={() => handleSort("rewards.usdcAmount")}
              >
                Rewards <SortIcon column="rewards.usdcAmount" />
              </div>
            </TableHead>
            <TableHead className="w-[150px] text-center">
              <div
                className="flex items-center justify-center cursor-pointer"
                onClick={() => handleSort("endTime")}
              >
                Ended On <SortIcon column="endTime" />
              </div>
            </TableHead>
            <TableHead className="w-[120px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, index) => (
            <TableRow key={task._id}>
              <TableCell className="text-center">
                {(currentPage - 1) * 12 + index + 1}
              </TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell className="text-center">{task.category}</TableCell>
              <TableCell className="text-center">
                {task.rewards.usdcAmount} USDC
              </TableCell>
              <TableCell className="text-center">
                {new Date(task.endTime).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-center">
                <Button variant="link" onClick={() => setSelectedTask(task)}>
                  More Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i + 1)}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{selectedTask?.description}</p>
            <div>
              <h4 className="font-semibold">Requirements:</h4>
              <ul className="list-disc pl-5">
                {selectedTask?.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Rewards:</h4>
              <p>USDC: {selectedTask?.rewards.usdcAmount}</p>
              {selectedTask?.rewards.nftReward && (
                <p>NFT: {selectedTask.rewards.nftReward}</p>
              )}
            </div>
          </div>
          {/* show the winner to if isWinnerDeclared is true or show Winner is yet to be Declared. If the winners array is null then show "No Winner" */}
          <div>
            <h4 className="font-semibold">Winners:</h4>
            {selectedTask?.isWinnerDeclared ? (
              selectedTask.winners.length ? (
                <ul className="list-disc pl-5">
                  {selectedTask.winners.map((winner, i) => (
                    <li key={i}>{winner}</li>
                  ))}
                </ul>
              ) : (
                <p>No Winner</p>
              )
            ) : (
              <p>Winner is yet to be Declared</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PastTask = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <TaskContent />
    </Suspense>
  );
};

export default PastTask;
