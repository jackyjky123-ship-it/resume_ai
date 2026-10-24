"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import type { ResumeDocument } from "@/lib/validations/resume";
import type { TemplateId } from "@/lib/resume-meta";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { ResumeBody } from "./resume-body";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const TOP_MARGIN_SUBSEQUENT = 48;
const BOTTOM_MARGIN = 48;
const COMPACT_DIVIDER_LEFT = 40 + (PAGE_WIDTH - 80) * 0.33;
const DESIGNER_DIVIDER_LEFT = 40 + (PAGE_WIDTH - 80) * 0.36;

export interface PageSlice {
  pageNumber: number;
  startY: number;
  endY: number;
}

function computePageSlices(measureEl: HTMLElement): PageSlice[] {
  const rootRect = measureEl.getBoundingClientRect();
  const totalHeight = Math.max(measureEl.scrollHeight, measureEl.offsetHeight);

  // If content fits within 1 single A4 sheet (with 35px flex threshold)
  if (totalHeight <= PAGE_HEIGHT + 35) {
    return [{ pageNumber: 1, startY: 0, endY: totalHeight }];
  }

  // Collect all breakable element items
  const breakElements = Array.from(
    measureEl.querySelectorAll<HTMLElement>("[data-page-break]")
  );

  const items = breakElements
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const type = el.getAttribute("data-page-break") || "item";
      return {
        type,
        top: Math.round(rect.top - rootRect.top),
        bottom: Math.round(rect.bottom - rootRect.top),
        height: Math.round(rect.height),
      };
    })
    .filter((item) => item.height > 0);

  const slices: PageSlice[] = [];
  let currentStartY = 0;
  let pageNumber = 1;

  while (currentStartY < totalHeight) {
    const isFirstPage = pageNumber === 1;
    // Page 1 has built-in py-12; target usable content ends around 1075px
    const usableHeight = isFirstPage
      ? PAGE_HEIGHT - BOTTOM_MARGIN
      : PAGE_HEIGHT - TOP_MARGIN_SUBSEQUENT - BOTTOM_MARGIN;

    const targetCutY = currentStartY + usableHeight;

    // If remaining content fits completely on this page
    if (targetCutY >= totalHeight - 25) {
      slices.push({
        pageNumber,
        startY: currentStartY,
        endY: totalHeight,
      });
      break;
    }

    // Minimum fill: a page must fill at least 45% of usable height
    const minCutY = currentStartY + Math.round(usableHeight * 0.45);

    // Collect all candidate cut points from element boundaries
    const candidateSet = new Set<number>();
    candidateSet.add(targetCutY);

    for (const it of items) {
      // Cut just before this item
      const before = it.top - 6;
      if (before >= minCutY && before <= targetCutY) {
        candidateSet.add(before);
      }
      // Cut just after this item
      const after = it.bottom + 6;
      if (after >= minCutY && after <= targetCutY) {
        candidateSet.add(after);
      }
    }

    // Sort candidate cut points in descending order (highest fill first)
    const candidates = Array.from(candidateSet).sort((a, b) => b - a);

    let chosenCutY: number | null = null;

    for (const cand of candidates) {
      // 1. Check if cand slices through ANY item
      const slicesItem = items.some(
        (it) => it.top < cand && it.bottom > cand
      );
      if (slicesItem) continue;

      // 2. Check if cand creates an orphan heading (less than 70px before cut)
      const orphanHeading = items.some(
        (it) =>
          it.type === "heading" &&
          it.top < cand &&
          it.bottom >= cand - 70
      );
      if (orphanHeading) continue;

      // Found a valid clean cut point!
      chosenCutY = cand;
      break;
    }

    // Fallback if no candidate completely avoided all items (e.g. huge item)
    if (chosenCutY === null) {
      for (const cand of candidates) {
        const orphanHeading = items.some(
          (it) =>
            it.type === "heading" &&
            it.top < cand &&
            it.bottom >= cand - 70
        );
        if (!orphanHeading) {
          chosenCutY = cand;
          break;
        }
      }
    }

    const actualCutY = chosenCutY ?? minCutY;

    slices.push({
      pageNumber,
      startY: currentStartY,
      endY: actualCutY,
    });

    currentStartY = actualCutY;
    pageNumber++;

    if (pageNumber > 10) break;
  }

  return slices.length > 0
    ? slices
    : [{ pageNumber: 1, startY: 0, endY: totalHeight }];
}

export function PagedResumePreview({
  document,
  templateId = "classic",
  className,
}: {
  document: ResumeDocument;
  templateId?: TemplateId;
  className?: string;
}) {
  const { isKhmer } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const innerStackRef = useRef<HTMLDivElement>(null);

  const [pages, setPages] = useState<PageSlice[]>([
    { pageNumber: 1, startY: 0, endY: PAGE_HEIGHT },
  ]);
  const [containerWidth, setContainerWidth] = useState<number>(PAGE_WIDTH);
  const [stackHeight, setStackHeight] = useState<number>(PAGE_HEIGHT);
  const [zoomMode, setZoomMode] = useState<"fit" | "75" | "100">("fit");
  const [activePageIndex, setActivePageIndex] = useState<number>(1);

  // Recalculate page breaks based on the offscreen measurement container
  const recalculatePages = useCallback(() => {
    if (!measureRef.current) return;
    const slices = computePageSlices(measureRef.current);
    setPages(slices);
  }, []);

  // Use layout effect to measure immediately on document / template change
  useLayoutEffect(() => {
    recalculatePages();
  }, [document, templateId, recalculatePages]);

  // Measure container width and observe DOM resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setContainerWidth(container.clientWidth);
      if (innerStackRef.current) {
        setStackHeight(innerStackRef.current.offsetHeight);
      }
    };

    updateDimensions();

    const ro = new ResizeObserver(() => {
      updateDimensions();
      recalculatePages();
    });

    ro.observe(container);
    if (measureRef.current) ro.observe(measureRef.current);
    if (innerStackRef.current) ro.observe(innerStackRef.current);

    return () => ro.disconnect();
  }, [recalculatePages]);

  // Compute CSS scale factor
  const scale =
    zoomMode === "fit"
      ? Math.min(1, Math.max(0.35, (containerWidth - 24) / PAGE_WIDTH))
      : zoomMode === "75"
      ? 0.75
      : 1;

  // Jump to specific page
  const scrollToPage = (pageNum: number) => {
    const el = documentRefById(`resume-canvas-page-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActivePageIndex(pageNum);
    }
  };

  const documentRefById = (id: string): HTMLElement | null => {
    if (typeof window === "undefined") return null;
    return window.document.getElementById(id);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative flex w-full flex-col items-center", className)}
    >
      {/* Offscreen Measurement Clone (Never visible, measures natural layout at 794px width) */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          width: PAGE_WIDTH,
          pointerEvents: "none",
          opacity: 0,
          visibility: "hidden",
          zIndex: -1,
        }}
      >
        <article
          className={cn(
            "flex w-[794px] flex-col text-[13px] leading-[1.55]",
            templateId === "navy" ? "bg-transparent p-0" : "bg-white px-10 py-12"
          )}
        >
          <ResumeBody document={document} templateId={templateId} />
        </article>
      </div>

      {/* Canva-Style Canvas Toolbar */}
      <div className="sticky top-0 z-20 -mx-3 -mt-3 mb-4 flex w-[calc(100%+1.5rem)] sm:-mx-5 sm:-mt-5 sm:w-[calc(100%+2.5rem)] flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-stone-100/95 dark:bg-card/90 px-3 py-2 sm:px-4 backdrop-blur-sm rounded-t-xl">
        {/* Left: Page count badge & navigation */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <span className="flex items-center gap-1.5 rounded-md bg-white dark:bg-muted px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs border border-border/60">
            <FileText className="size-3.5 text-primary" />
            <span>
              Page {activePageIndex} of {pages.length}
            </span>
          </span>

          {pages.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={activePageIndex <= 1}
                onClick={() => scrollToPage(Math.max(1, activePageIndex - 1))}
                aria-label="Previous Page"
                className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-white dark:bg-muted text-foreground shadow-2xs transition-colors hover:bg-neutral-50 dark:hover:bg-muted/80 disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={activePageIndex >= pages.length}
                onClick={() =>
                  scrollToPage(Math.min(pages.length, activePageIndex + 1))
                }
                aria-label="Next Page"
                className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-white dark:bg-muted text-foreground shadow-2xs transition-colors hover:bg-neutral-50 dark:hover:bg-muted/80 disabled:opacity-40"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Responsive Zoom Mode Controls */}
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded-lg border border-border/70 bg-white/90 dark:bg-muted/70 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomMode("fit")}
              className={cn(
                "rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer",
                zoomMode === "fit"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-muted"
              )}
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => setZoomMode("75")}
              className={cn(
                "rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer",
                zoomMode === "75"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-muted"
              )}
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => setZoomMode("100")}
              className={cn(
                "rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer",
                zoomMode === "100"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-muted"
              )}
            >
              100%
            </button>
          </div>
        </div>
      </div>

      {/* Scaled A4 Canvas Sheets Container */}
      <div className="flex w-full justify-center overflow-x-auto pb-4">
        <div
          style={{
            width: Math.round(PAGE_WIDTH * scale),
            height: stackHeight ? Math.round(stackHeight * scale) : "auto",
            position: "relative",
          }}
        >
          <div
            ref={innerStackRef}
            style={{
              width: PAGE_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
            className="flex flex-col items-center gap-6"
          >
            {pages.map((page, index) => {
              const isFirstPage = page.pageNumber === 1;
              const topOffset = isFirstPage ? 0 : TOP_MARGIN_SUBSEQUENT;
              const viewportHeight = isFirstPage
                ? page.endY
                : page.endY - page.startY;

              return (
                <div
                  key={page.pageNumber}
                  id={`resume-canvas-page-${page.pageNumber}`}
                  className="flex flex-col items-center"
                >
                  {/* Canva Page Header Badge */}
                  <div className="mb-2 flex w-[794px] items-center justify-between px-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-200/90 dark:bg-card/90 px-2.5 py-0.5 font-medium text-foreground shadow-2xs border border-border/40">
                      <FileText className="size-3 text-primary" />
                      {isKhmer
                        ? `ទំព័រ ${page.pageNumber} នៃ ${pages.length}`
                        : `Page ${page.pageNumber} of ${pages.length}`}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      A4 · 210 × 297 mm
                    </span>
                  </div>

                  {/* A4 Canvas Sheet */}
                  <div
                    className="relative w-[794px] h-[1123px] overflow-hidden rounded-xs bg-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)]"
                    style={{
                      width: PAGE_WIDTH,
                      height: PAGE_HEIGHT,
                      ...(templateId === "navy"
                        ? {
                            background:
                              "linear-gradient(to right, #1E2532 0%, #1E2532 36%, #FAF9F6 36%, #FAF9F6 100%)",
                          }
                        : {}),
                    }}
                  >
                    {/* Viewport Slice with precise overflow clipping */}
                    <div
                      style={{
                        position: "absolute",
                        top: topOffset,
                        left: 0,
                        width: PAGE_WIDTH,
                        height: viewportHeight,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          transform: `translateY(-${page.startY}px)`,
                        }}
                      >
                        <article
                          className={cn(
                            "flex w-[794px] flex-col text-[13px] leading-[1.55]",
                            templateId === "navy" ? "bg-transparent p-0" : "bg-white px-10 py-12"
                          )}
                        >
                          <ResumeBody
                            document={document}
                            templateId={templateId}
                          />
                        </article>
                      </div>
                    </div>

                    {/* Column rule continuation for pages after the first */}
                    {!isFirstPage &&
                      (templateId === "compact" || templateId === "designer") && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-12 top-12 w-px"
                          style={{
                            left:
                              templateId === "compact"
                                ? COMPACT_DIVIDER_LEFT
                                : DESIGNER_DIVIDER_LEFT,
                            backgroundColor:
                              templateId === "compact" ? "#e5e5e5" : "#d4d4d4",
                          }}
                        />
                      )}
                  </div>

                  {/* Canva Inter-Page Divider (Rendered between pages) */}
                  {index < pages.length - 1 && (
                    <div className="mt-8 flex w-[794px] items-center justify-center gap-4">
                      <div className="h-px flex-1 bg-neutral-300" />
                      <span className="rounded-full border border-neutral-300 bg-neutral-200/80 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 shadow-2xs">
                        {isKhmer
                          ? `ដាច់ទំព័រ · បន្តនៅទំព័រទី ${page.pageNumber + 1}`
                          : `Page Break · Continues on Page ${page.pageNumber + 1}`}
                      </span>
                      <div className="h-px flex-1 bg-neutral-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
