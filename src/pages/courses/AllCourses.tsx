import { useEffect, useMemo, useState } from "react";
import Layout from "@/Layout";
import { useGetCoursesQuery } from "@/redux/queries/productApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import Paginate from "@/components/Paginate";
import {
  Search,
  FileText,
  Lock,
  X,
  ArrowUpDown,
  LayoutGrid,
  List,
  Filter,
  Unlock,
  Check,
  RotateCcw,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";

type Course = {
  _id: string;
  code: string;
  image?: string;
  resources?: any[];
  isClosed?: boolean;
  isPaid?: boolean;
  badge?: string;
};

type SortKey =
  | "code_asc"
  | "code_desc"
  | "resources_desc"
  | "resources_asc"
  | "locked_first"
  | "open_first";

type ViewMode = "grid" | "compact";

const AllCourses = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: any) => state.auth);

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  const [sort, setSort] = useState<SortKey>("code_asc");
  const [view, setView] = useState<ViewMode>("grid");

  // ✅ Filter popover (functional)
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ✅ Filter state
  const [access, setAccess] = useState<"all" | "open" | "locked">("all");
  const [pricing, setPricing] = useState<"all" | "free" | "paid">("all");
  const [withImage, setWithImage] = useState(false);

  // Resource range (simple + practical)
  const [minResources, setMinResources] = useState<number>(0);
  const [maxResources, setMaxResources] = useState<number>(0); // 0 = no max

  const purchasedIds: string[] = userInfo?.purchasedCourses || [];

  const { data, isLoading } = useGetCoursesQuery({
    pageNumber: page,
    keyword,
  });

  const categories: Course[] = data?.courses || [];
  const pages = data?.pages || 1;

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const isLocked = (c: Course) => {
    const hasAccess = purchasedIds.includes(c._id);
    return !!c.isClosed || (!!c.isPaid && !hasAccess);
  };

  // for slider bounds
  const maxPossibleResources = useMemo(() => {
    const counts = categories.map((c) => c.resources?.length || 0);
    return counts.length ? Math.max(...counts) : 50;
  }, [categories]);

  const hasActiveFilters = useMemo(() => {
    return (
      access !== "all" || pricing !== "all" || withImage || minResources > 0 || maxResources > 0
    );
  }, [access, pricing, withImage, minResources, maxResources]);

  const filteredAndSorted = useMemo(() => {
    let list = [...categories];

    // ✅ Access
    if (access === "open") list = list.filter((c) => !isLocked(c));
    if (access === "locked") list = list.filter((c) => isLocked(c));

    // ✅ Pricing
    if (pricing === "free") list = list.filter((c) => !c.isPaid);
    if (pricing === "paid") list = list.filter((c) => !!c.isPaid);

    // ✅ With image
    if (withImage) list = list.filter((c) => !!c.image);

    // ✅ Resource range
    if (minResources > 0) list = list.filter((c) => (c.resources?.length || 0) >= minResources);
    if (maxResources > 0) list = list.filter((c) => (c.resources?.length || 0) <= maxResources);

    // ✅ Sort
    list.sort((a, b) => {
      const ac = (a.code || "").toUpperCase();
      const bc = (b.code || "").toUpperCase();
      const ar = a.resources?.length || 0;
      const br = b.resources?.length || 0;

      switch (sort) {
        case "code_asc":
          return ac.localeCompare(bc);
        case "code_desc":
          return bc.localeCompare(ac);
        case "resources_desc":
          return br - ar;
        case "resources_asc":
          return ar - br;
        case "locked_first":
          return Number(isLocked(b)) - Number(isLocked(a));
        case "open_first":
          return Number(isLocked(a)) - Number(isLocked(b));
        default:
          return 0;
      }
    });

    return list;
  }, [categories, sort, access, pricing, withImage, minResources, maxResources, purchasedIds]);

  const handleGoToCourse = (id: string) => {
    if (!userInfo) {
      toast.info("You need to login first", { position: "top-center" });
      return;
    }
    navigate(`/course/${id}`);
  };

  const clearFilters = () => {
    setAccess("all");
    setPricing("all");
    setWithImage(false);
    setMinResources(0);
    setMaxResources(0);
  };

  const activePills = useMemo(() => {
    const pills: string[] = [];
    if (access === "open") pills.push("Open only");
    if (access === "locked") pills.push("Locked only");
    if (pricing === "free") pills.push("Free");
    if (pricing === "paid") pills.push("Paid");
    if (withImage) pills.push("Has image");
    if (minResources > 0) pills.push(`Min ${minResources} res`);
    if (maxResources > 0) pills.push(`Max ${maxResources} res`);
    return pills;
  }, [access, pricing, withImage, minResources, maxResources]);

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen px-3 py-20 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 space-y-5">
            <h1 className="text-5xl font-bold text-black tracking-tight">Explore Courses</h1>

            {/* Search + Controls */}
            <div className="w-full flex flex-col gap-3 md:flex-row md:items-center md:justify-center">
              {/* Search */}
              <div className="relative w-full md:w-[420px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-12 pr-10 py-3 rounded-xl border bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-tomato outline-none"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    aria-label="Clear search">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap justify-start">
                {/* View */}
                <div className="inline-flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setView("grid")}
                    className={`px-3 py-3 ${
                      view === "grid" ? "bg-black text-white" : "hover:bg-gray-50"
                    }`}
                    aria-label="Grid view">
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView("compact")}
                    className={`px-3 py-3 ${
                      view === "compact" ? "bg-black text-white" : "hover:bg-gray-50"
                    }`}
                    aria-label="List view">
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort */}
                <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="bg-transparent outline-none text-sm font-semibold text-gray-800">
                    <option value="code_asc">Code A–Z</option>
                    <option value="code_desc">Code Z–A</option>
                    <option value="resources_desc">Most resources</option>
                    <option value="resources_asc">Least resources</option>
                    <option value="open_first">Open first</option>
                    <option value="locked_first">Locked first</option>
                  </select>
                </div>

                {/* ✅ Functional Filter Button (popover) */}
                <div className="relative">
                  <button
                    onClick={() => setFiltersOpen((v) => !v)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition
                      ${
                        filtersOpen || hasActiveFilters
                          ? "bg-black text-white border-black"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}>
                    <Filter className="w-4 h-4" />
                    Filters
                    <ChevronDown
                      className={`w-4 h-4 transition ${filtersOpen ? "rotate-180" : ""}`}
                    />
                    {hasActiveFilters && (
                      <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold">
                        ON
                      </span>
                    )}
                  </button>

                  {filtersOpen && (
                    <>
                      {/* click-away overlay */}
                      <button
                        className="fixed inset-0 z-30 cursor-default"
                        onClick={() => setFiltersOpen(false)}
                        aria-label="Close filters"
                      />
                      <div className="absolute right-0 mt-2 w-[340px] z-40 rounded-2xl border border-gray-200 bg-white shadow-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-extrabold text-gray-900">Filters</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Narrow down courses quickly.
                            </p>
                          </div>
                          <button
                            onClick={() => setFiltersOpen(false)}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                            aria-label="Close">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Access */}
                        <div className="mt-4">
                          <p className="text-xs font-bold text-gray-700 mb-2">Access</p>
                          <div className="grid grid-cols-3 gap-2">
                            <Pill
                              active={access === "all"}
                              onClick={() => setAccess("all")}
                              label="All"
                            />
                            <Pill
                              active={access === "open"}
                              onClick={() => setAccess("open")}
                              label="Open"
                              icon={<Unlock className="w-4 h-4" />}
                            />
                            <Pill
                              active={access === "locked"}
                              onClick={() => setAccess("locked")}
                              label="Locked"
                              icon={<Lock className="w-4 h-4" />}
                            />
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="mt-4">
                          <p className="text-xs font-bold text-gray-700 mb-2">Pricing</p>
                          <div className="grid grid-cols-3 gap-2">
                            <Pill
                              active={pricing === "all"}
                              onClick={() => setPricing("all")}
                              label="All"
                            />
                            <Pill
                              active={pricing === "free"}
                              onClick={() => setPricing("free")}
                              label="Free"
                            />
                            <Pill
                              active={pricing === "paid"}
                              onClick={() => setPricing("paid")}
                              label="Paid"
                            />
                          </div>
                        </div>

                        {/* With image */}
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setWithImage((v) => !v)}
                            className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition
                              ${
                                withImage
                                  ? "border-black bg-black text-white"
                                  : "border-gray-200 bg-white hover:bg-gray-50"
                              }`}>
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-sm font-bold">Has image</span>
                            </div>
                            {withImage && <Check className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Resource range */}
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                          <p className="text-xs font-bold text-gray-700 mb-2">Resources count</p>

                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>Min: {minResources}</span>
                            <span>Max: {maxResources || "∞"}</span>
                          </div>

                          <div className="mt-2 space-y-3">
                            <div>
                              <label className="text-[11px] text-gray-600">Minimum</label>
                              <input
                                type="range"
                                min={0}
                                max={maxPossibleResources || 50}
                                value={minResources}
                                onChange={(e) => setMinResources(Number(e.target.value))}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-gray-600">
                                Maximum (0 = no max)
                              </label>
                              <input
                                type="range"
                                min={0}
                                max={maxPossibleResources || 50}
                                value={maxResources}
                                onChange={(e) => setMaxResources(Number(e.target.value))}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer actions */}
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
                            <RotateCcw className="w-4 h-4" />
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setFiltersOpen(false)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-sm font-bold text-white">
                            <Check className="w-4 h-4" />
                            Apply
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Active pills row */}
            {activePills.length > 0 && (
              <div className="w-full flex flex-wrap items-center justify-center gap-2">
                {activePills.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center rounded-full bg-tomato/10 text-tomato px-3 py-1 text-xs font-black">
                    {p}
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="ml-1 inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50">
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Grid / List */}
          {view === "grid" ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredAndSorted.map((cat) => {
                const locked = isLocked(cat);
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleGoToCourse(cat._id)}
                    className="relative rounded-xl overflow-hidden aspect-square shadow group">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition"
                      style={{
                        backgroundImage: `url(${cat.image || "/placeholder.png"})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40" />

                    {locked && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </div>
                    )}

                    <div className="absolute bottom-0 p-4 text-white">
                      <p className="font-semibold uppercase">{cat.code}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <FileText className="w-4 h-4" />
                        {cat.resources?.length || 0} resources
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSorted.map((cat) => {
                const locked = isLocked(cat);
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleGoToCourse(cat._id)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                    <div className="flex-1 text-left">
                      <p className="font-semibold uppercase text-gray-900">{cat.code}</p>
                      <p className="text-sm text-gray-600">
                        {cat.resources?.length || 0} resources
                      </p>
                    </div>
                    {locked && (
                      <span className="text-xs border border-gray-200 px-3 py-1 rounded-full text-gray-700">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {filteredAndSorted.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No courses found.</p>
          )}

          <div className="pt-10">
            <Paginate page={page} pages={pages} setPage={setPage} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AllCourses;

/* ------------------------------- UI helpers ------------------------------- */

function Pill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition
        ${
          active
            ? "bg-black text-white border-black"
            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-800"
        }`}>
      {icon}
      {label}
    </button>
  );
}
