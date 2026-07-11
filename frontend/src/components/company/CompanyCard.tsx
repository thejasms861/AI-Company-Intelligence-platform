import { CompanyShort } from "@/types/company";
import { Building2, Users, TrendingUp, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getDepartmentsForCompany } from "@/utils/departments";

interface CompanyCardProps {
  company: CompanyShort;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const id = company.company_id;

  const originalLogoUrl = company.logo_url;
  let logoUrl = typeof originalLogoUrl === 'string' ? originalLogoUrl : '';
  
  if (logoUrl) {
    if (logoUrl.includes(';') || logoUrl.includes(',')) {
      logoUrl = logoUrl.split(/[;,]/)[0].trim();
    }
    
    // If it's not a full URL (e.g. just "microsoft.com" or "logo.svg")
    if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
      let domain = logoUrl;
      if (logoUrl.includes('.svg') || logoUrl.includes('.png') || !logoUrl.includes('.')) {
        domain = company.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      }
      logoUrl = `https://logo.uplead.com/${domain}`;
    }

    if (logoUrl.includes('clearbit.com')) {
      const domain = logoUrl.split('/').pop() || (company.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '.com');
      logoUrl = `https://logo.uplead.com/${domain}`;
    }
  }

  // FORCE OLD LOGOS FOR SPECIFIC COMPANIES
  const forceOldLogoNames = [
    "capgemini",
    "pricewaterhouse",
    "publicis",
    "qicap",
    "redhat",
    "red hat",
    "roppen",
    "wipro",
    "zenken"
  ];
  
  if (company.name) {
    const isOldLogoCompany = forceOldLogoNames.some(n => company.name.toLowerCase().includes(n));
    if (isOldLogoCompany) {
      let fallbackDomain = company.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
      if (originalLogoUrl && typeof originalLogoUrl === 'string' && originalLogoUrl.includes('//')) {
        try { fallbackDomain = new URL(originalLogoUrl.split(/[;,]/)[0].trim()).hostname; } catch (e) {}
      }
      logoUrl = `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=128`;
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
              target.onerror = null; // Prevent infinite loops
              
              let fallbackDomain = company.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
              
              if (target.src.includes('duckduckgo.com')) {
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.short_name || company.name)}&background=random&color=fff`;
              } else if (target.src.includes('uplead.com')) {
                target.src = `https://icons.duckduckgo.com/ip3/${fallbackDomain}.ico`;
              } else {
                target.src = `https://logo.uplead.com/${fallbackDomain}`;
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
          <div className="flex flex-wrap gap-1 mt-1">
            {company.category && (
              <span className="chip inline-block">{company.category}</span>
            )}
            {getDepartmentsForCompany(company.name, company.category || "").map(dept => (
              <span key={dept} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 inline-block">
                {dept}
              </span>
            ))}
            {company.company_tier && (
              <span className={`text-xs font-bold px-2 py-1 rounded-md border inline-flex items-center gap-1 shadow-sm ${
                company.company_tier.includes("Elite") ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/40" : 
                company.company_tier.includes("Premium") ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/40" :
                company.company_tier.includes("Mass") ? "bg-amber-500/15 text-amber-600 dark:text-amber-500 border-amber-500/40" :
                "bg-emerald-500/15 text-emerald-600 dark:text-emerald-500 border-emerald-500/40"
              }`}>
                <span>🏆</span> {company.company_tier}
              </span>
            )}
          </div>
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
