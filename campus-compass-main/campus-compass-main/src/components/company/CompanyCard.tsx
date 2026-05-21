import { CompanyShort } from "@/types/company";
import { Building2, Users, TrendingUp, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface CompanyCardProps {
  company: CompanyShort;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const id = company.company_id;

  const originalLogoUrl = company.logo_url;
  let logoUrl = originalLogoUrl;
  
  if (logoUrl && logoUrl.includes('clearbit.com')) {
    try {
      const url = new URL(logoUrl);
      const domain = url.pathname.split('/').pop() || url.hostname;
      logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      // fallback handled by onError
    }
  }

  return (
    <Link
      to={`/company/${encodeURIComponent(id)}`}
      className="surface-card p-4 hover:shadow-md transition-shadow group block"
    >
      <div className="flex items-start gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={company.name}
            className="w-10 h-10 rounded-md object-contain bg-muted p-1 flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              let fallbackDomain = "";
              try {
                if (originalLogoUrl && originalLogoUrl.includes('//')) {
                  fallbackDomain = new URL(originalLogoUrl).hostname;
                } else {
                  fallbackDomain = company.name.split(' ')[0].toLowerCase() + ".com";
                }
              } catch (err) {
                fallbackDomain = "company.com";
              }
              
              if (target.src.includes('google.com/s2/favicons')) {
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.short_name || company.name)}&background=random&color=fff`;
              } else {
                target.src = `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=128`;
              }
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {company.name || "Not Available"}
          </h3>
          {company.category && (
            <span className="chip mt-1 inline-block">{company.category}</span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span className="truncate">{company.employee_size || "Not Available"}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={12} />
          <span className="truncate">{company.yoy_growth_rate || "Not Available"}</span>
        </div>
        <div className="flex items-center gap-1 col-span-2">
          <MapPin size={12} />
          <span className="truncate">{company.office_locations || company.operating_countries || "Not Available"}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 pt-3 border-t border-border/50">
        <Link
          to={`/company/${encodeURIComponent(id)}?tab=innovation`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-center transition-colors"
        >
          Innovx
        </Link>
        <Link
          to={`/company/${encodeURIComponent(id)}?tab=hiring`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-secondary hover:bg-muted text-secondary-foreground py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-center transition-colors border border-border/50"
        >
          Hiring Rounds
        </Link>
      </div>
    </Link>
  );
}
