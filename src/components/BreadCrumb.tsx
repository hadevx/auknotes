import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center text-sm text-gray-600 mb-8">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {item.href && !isLast ? (
              <Link to={item.href} className="hover:text-tomato transition-colors font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-400">{item.label}</span>
            )}

            {!isLast && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
