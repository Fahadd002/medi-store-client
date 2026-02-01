"use client";

import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  maxVisiblePages?: number;
}

export function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  maxVisiblePages = 5,
}: PaginationComponentProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const visiblePageNumbers = useMemo(() => {
    const pages: number[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      // Adjust start if we're near the end
      startPage = Math.max(2, endPage - maxVisiblePages + 3);
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isFirstPage && !isLoading) {
                onPageChange(currentPage - 1);
              }
            }}
            className={isFirstPage || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {visiblePageNumbers.map((pageNum, index) => {
          if (pageNum === -1) {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <span className="px-4 py-2">...</span>
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLoading) {
                    onPageChange(pageNum);
                  }
                }}
                isActive={pageNum === currentPage}
                className={!isLoading ? "cursor-pointer" : ""}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isLastPage && !isLoading) {
                onPageChange(currentPage + 1);
              }
            }}
            className={isLastPage || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
