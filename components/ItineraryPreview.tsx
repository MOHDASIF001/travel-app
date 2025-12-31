
import React from 'react';
import { Branding, ItineraryData } from '../types';
import { Check, MapPin, Calendar, Star, Instagram, Phone, Info, Globe, Navigation2, Clock } from 'lucide-react';
import { color } from 'framer-motion';

interface ItineraryPreviewProps {
  data: ItineraryData;
  branding: Branding;
}

export const ItineraryPreview: React.FC<ItineraryPreviewProps> = ({ data, branding }) => {
  if (!data) return <div className="p-20 text-center bg-white rounded-2xl shadow-xl">Preparing your Itinerary...</div>;

  // Use branding colors from settings, fallback to defaults if not set
  const primaryColor = branding?.primaryColor || '#D31A1A';
  const secondaryColor = branding?.secondaryColor || '#300000';
  const exploreColor = branding?.exploreTextColor || '#FFD700';
  const destinationNameColor = branding?.destinationTextColor || '#FFFFFF';
  const bannerBgColor = branding?.bannerBgColor || '#4a0404';
  const bannerTextColor = branding?.bannerTextColor || '#FFFFFF';
  const bannerBorderColor = branding?.bannerBorderColor || '#FFD700';
  const headingColor = branding?.headingColor || primaryColor;
  const subHeadingColor = branding?.subHeadingColor || secondaryColor;
  const sectionTitleColor = branding?.subHeadingColor || '#000000'; // Kept for backward compatibility if needed, but mapped to subHeadingColor
  const highlightColor = branding?.highlightTextColor || '#D31A1A';
  const badgeBgColor = branding?.badgeBgColor || '#D31A1A';
  const badgeTextColor = branding?.badgeTextColor || '#FFFFFF';
  const textColor = branding?.textColor || '#111111';
  const iconColor = branding?.primaryColor || '#D31A1A'; // Mapped to Primary Color
  const overviewTitleColor = branding?.subHeadingColor || '#000000'; // Mapped to Sub Heading
  const overviewTextColor = branding?.textColor || '#111111'; // Mapped to Body Text

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < (count || 0) ? '#fbbf24' : '#e2e8f0', fontSize: '16px' }}>★</span>
    ));
  };

  const getDayDateInfo = (index: number, dateStr?: string) => {
    if (!dateStr) return { day: String(index + 1), full: '' };
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { day: String(index + 1), full: dateStr };
      return {
        day: String(index + 1),
        full: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
    } catch (e) {
      return { day: String(index + 1), full: dateStr };
    }
  };

  const LeafElement = () => (
    <div style={{
      width: '42px',
      height: '52px',
      backgroundColor: primaryColor,
      borderTopLeftRadius: '22px',
      borderBottomRightRadius: '22px',
      flexShrink: 0
    }} />
  );

  const CostRow = ({ label, value, labelColor = textColor, valueColor = textColor }: { label: string, value: string | number | undefined, labelColor?: string, valueColor?: string, key?: React.Key }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', width: '100%', breakInside: 'avoid' }}>
      <LeafElement />
      <div style={{
        flex: 1,
        height: '52px',
        backgroundColor: '#fff',
        border: '1.5px solid #e2e8f0',
        borderTopRightRadius: '22px',
        borderBottomLeftRadius: '22px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
      }}>
        <div style={{
          width: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 800,
          color: labelColor,
          backgroundColor: '#fcfcfc',
          borderRight: '1px solid #eee'
        }}>
          {label}
        </div>
        <div style={{
          width: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 800,
          color: valueColor
        }}>
          {value || '0'}
        </div>
      </div>
      <LeafElement />
    </div>
  );

  const PolicyBox = ({ title, items, bgColor, accentColor, textColorOverride }: { title: string, items: string[], bgColor: string, accentColor: string, textColorOverride?: string }) => (
    <div style={{ marginBottom: '35px', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <div style={{ width: '6px', height: '28px', backgroundColor: accentColor, borderRadius: '4px' }}></div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, color: sectionTitleColor, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ backgroundColor: bgColor, padding: '25px 30px', borderRadius: '24px', color: textColorOverride || '#000' }}>
        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: '1.4' }}>
              <span style={{ fontSize: '20px', lineHeight: '0.8', marginTop: '4px' }}>•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const MontageImage = ({ src, top, left, zIndex }: { src: string; top: string; left: string; zIndex: number }) => (
    <div style={{
      position: 'absolute',
      top,
      left,
      width: '235px',
      height: '235px',
      // borderTopRightRadius: '22px',
      borderBottomLeftRadius: '22px',
      transform: 'rotate(45deg)',
      overflow: 'hidden',
      zIndex,
      backgroundColor: '#fff'
    }}>
      {src && (
        <div
          style={{
            position: 'absolute',
            width: '142%',
            height: '142%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            backgroundImage: `url("${src}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );

  const renderLogo = (variant: 'light' | 'dark' = 'light', size: 'sm' | 'md' | 'lg' = 'md') => {
    if (branding?.logoUrl) {
      const heights = { sm: '50px', md: '70px', lg: '110px' };
      return <img src={branding.logoUrl} style={{ height: heights[size], maxWidth: '250px', objectFit: 'contain' }} alt={branding.companyName} />;
    }
    const colors = variant === 'light' ? { text: '#fff', bg: '#fff', icon: primaryColor } : { text: primaryColor, bg: primaryColor, icon: '#fff' };
    const fontSizes = { sm: '24px', md: '42px', lg: '72px' };
    // const circleSizes = { sm: '25px', md: '45px', lg: '70px' };
    const iconSizes = { sm: '14px', md: '24px', lg: '40px' };

    // return (
    //   <div style={{ display: 'flex', alignItems: 'center' }}>
    //     <span style={{ fontSize: fontSizes[size], fontWeight: 900, color: colors.text, letterSpacing: '-2px' }}>
    //       {branding?.companyName?.split(' ')[0] || 'trip'}
    //     </span>
    //     {/* <div style={{ width: circleSizes[size], height: circleSizes[size], background: colors.bg, borderRadius: '50%', margin: '0 5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    //       <span style={{ fontSize: iconSizes[size] }}></span>
    //     </div> */}
    //     {/* <span style={{ fontSize: fontSizes[size], fontWeight: 900, color: colors.text, letterSpacing: '-2px' }}>
    //       {branding?.companyName?.split(' ')[1]}
    //     </span> */}
    //   </div>
    // );
  };

  const hotelList = Array.isArray(data.selectedHotels) ? data.selectedHotels : [];
  const uniqueCategories = Array.from(new Set(hotelList.map(h => (h.category || 'General').trim())));

  return (
    <div id="itinerary-pdf" className="bg-white mx-auto shadow-2xl overflow-hidden print:shadow-none" style={{ width: '210mm', color: textColor, fontFamily: 'Inter, sans-serif', WebkitPrintColorAdjust: 'exact' }}>

      {/* PAGE 1: COVER */}
      <section className="relative w-full h-[296mm] overflow-hidden page-break" style={{ background: `linear-gradient(165deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
        <div style={{ position: 'absolute', top: '80px', left: '25px', zIndex: 100 }}>
          {renderLogo('light', 'md')}
          <div style={{ fontSize: '12px', color: '#fff', opacity: 0.9, letterSpacing: '1px', marginLeft: '2px', marginTop: '5px' }}>{branding?.companyName ? 'Official Itinerary' : 'make your trips everyday'}</div>
        </div>

        <div style={{ position: 'absolute', top: '22%', left: '25px', zIndex: 100 }}>
          <h2 style={{ fontSize: '45px', fontWeight: 400, fontFamily: "'Dancing Script', cursive", color: exploreColor, margin: '0 0 -5px 0' }}>Explore</h2>
          <h1 style={{ fontSize: '50px', fontWeight: 900, textTransform: 'uppercase', lineHeight: '1.0', color: destinationNameColor, letterSpacing: '2px', margin: 0, maxWidth: '420px' }}>
            {(data.packageName || data.destinations?.split(',')[0].trim() || 'KASHMIR').toUpperCase()}
          </h1>
        </div>

        <div style={{ position: 'absolute', top: '50%', left: '-1px', zIndex: 100 }}>
          <div style={{ backgroundColor: bannerBorderColor, padding: '1px 10px 1px 0px', clipPath: 'polygon(0% 0%, 86% 0%, 100% 50%, 86% 100%, 0% 100%)' }}>
            <div style={{ background: bannerBgColor, color: bannerTextColor, padding: '10px 60px 12px 20px', clipPath: 'polygon(0% 0%, 86% 0%, 100% 50%, 86% 100%, 0% 100%)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 900, fontSize: '36px', lineHeight: '1', letterSpacing: '-1.5px' }}>{data.duration}</div>
              <div style={{ fontSize: '20px', fontWeight: 500, opacity: 0.9 }}>{data.packageType || 'Premium package'}</div>
            </div>
          </div>
        </div>

        {/* CLIENT NAME - 20px above Package Overview */}
        <div style={{ position: 'absolute', bottom: '310px', left: '5px', zIndex: 100 }}>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Client Name:- <span style={{ color: exploreColor }}>{data.clientName || 'Valued Guest'}</span>
          </h3>
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <MontageImage src={data.coverImages?.[0]} top="4%" left="48%" zIndex={10} />
          <MontageImage src={data.coverImages?.[1]} top="21%" left="70%" zIndex={20} />
          <MontageImage src={data.coverImages?.[2]} top="38%" left="45%" zIndex={30} />
          <MontageImage src={data.coverImages?.[3]} top="54%" left="67%" zIndex={40} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)' }} />
        </div>

        <div style={{ position: 'absolute', bottom: '65px', left: '0', right: '0', backgroundColor: '#fff', padding: '10px 15px', zIndex: 1 }}>
          <h3 style={{ fontSize: '24px', fontWeight: 900, color: branding?.overviewTitleColor || sectionTitleColor, marginBottom: '4px' }}>Package Overview</h3>
          <p style={{ fontSize: '16px', lineHeight: '1.45', color: branding?.overviewTextColor || textColor, margin: 0, textAlign: 'justify' }}>{data.overview}</p>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 110 }}>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={16} /> {branding?.phone}
          </div>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} /> {branding?.website}
          </div>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 900 }}>
            👤 {branding?.companyName || 'Travel Partner'}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div style={{ background: '#fff', padding: '20px 45px' }}>

        {/* DAY WISE ITINERARY - EXACT DESIGN MATCH */}
        <div style={{ marginBottom: '50px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: sectionTitleColor, textTransform: 'uppercase' }}>Day Wise Plan</h2>
          </div>
          {data.days?.map((day, idx) => {
            const dateInfo = getDayDateInfo(idx, day.date);
            return (
              <div key={day.id} style={{ marginBottom: '35px', breakInside: 'avoid' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', width: '100%', marginBottom: '6px', margin: 'auto' }}>
                  {/* LEFT: DAY BADGE - EXACT IMAGE DESIGN */}
                  <div style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '2px'
                  }}>
                    {/* Red Pill */}
                    <div style={{
                      backgroundColor: primaryColor,
                      borderRadius: '5px',
                      padding: '4px 15px 4px 8px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}>
                      <span style={{
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: 800,
                      }}>Day</span>
                    </div>
                    {/* Overlapping Circle */}
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      border: `2px solid ${primaryColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 900,
                      color: primaryColor,
                      marginLeft: '-14px',
                      zIndex: 2,
                      // boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {dateInfo.day}
                    </div>
                  </div>

                  {/* MIDDLE & RIGHT: TITLE, DASHED LINE, AND DATE */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingTop: '4px' }}>
                      {/* Activity Title */}
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 900,
                        color: highlightColor,
                        margin: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        {day.title}
                      </h3>
                      {/* Connecting Dashed Line */}
                      <div style={{
                        flex: 1,
                        height: '0px',
                        borderBottom: `2px dashed ${highlightColor}`,
                        opacity: 0.2,
                        margin: '0 15px',
                        alignSelf: 'center',
                        marginTop: '6px'
                      }}></div>
                      {/* Date on Right */}
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 900,
                        color: highlightColor,
                        whiteSpace: 'nowrap',
                        marginTop: '0px'
                      }}>
                        {dateInfo.full || `Day ${idx + 1}`}
                      </div>
                    </div>

                    {/* LOGISTICS BELOW TITLE - Grayish Blue Style */}
                    {(day.distance || day.travelTime) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                        {day.distance && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                            <MapPin size={13} color={primaryColor} /> {day.distance}
                          </div>
                        )}
                        {day.distance && day.travelTime && (
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div>
                        )}
                        {day.travelTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                            <Clock size={13} color={primaryColor} /> {day.travelTime}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION - Aligned with the start of the title */}
                <p style={{
                  fontSize: '17px',
                  lineHeight: '1.6',
                  color: textColor,
                  textAlign: 'justify',
                  fontWeight: 500,
                  margin: '5px 0 0 0',
                  paddingLeft: '70px'
                }}>
                  {day.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* HOTEL ACCOMMODATIONS */}
        <div style={{ borderTop: `1px solid #eee`, paddingTop: '20px', marginBottom: '50px' }}>
          {uniqueCategories.map((loc) => {
            const catHotels = hotelList.filter(h => (h.category || 'General').trim() === loc);
            if (catHotels.length === 0) return null;
            return (
              <div key={loc} style={{ marginBottom: '35px', breakInside: 'auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <span style={{ backgroundColor: badgeBgColor, color: badgeTextColor, padding: '5px 25px', fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', borderRadius: '4px' }}>
                    Stay in {loc}
                  </span>
                </div>
                {catHotels.map(hotel => (
                  <div key={hotel.id} style={{ width: '100%', background: '#fcfcfc', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', display: 'flex', breakInside: 'avoid', border: '1.5px solid #eee' }}>
                    <div style={{ padding: '10px 20px', flex: '1.2', borderRight: '1.5px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 900, color: highlightColor, margin: 0 }}>{hotel.name}</h3>
                        <div style={{ display: 'flex', gap: '2px' }}>{renderStars(hotel.stars)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                        <MapPin size={16} color={iconColor} />
                        <p style={{ fontSize: '16px', color: textColor, fontWeight: 500, margin: 0, opacity: 0.8 }}>{hotel.location}</p>
                      </div>
                      <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: 900, color: textColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Amenities</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {hotel.amenities?.slice(0, 6).map((am, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Check size={10} color="#fff" strokeWidth={4} />
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>{am}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: '1', padding: '15px', backgroundColor: '#fff' }}>
                      <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #eee', backgroundColor: '#f9f9f9', marginBottom: '5px' }}>
                        {hotel.images && hotel.images[0] ? (
                          <img src={hotel.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={hotel.name} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#ccc' }}>Photo Pending</span></div>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                        {[1, 2, 3].map((idx) => (
                          <div key={idx} style={{ height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                            {hotel.images && hotel.images[idx] ? (
                              <img src={hotel.images[idx]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery" />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={14} color="#eee" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* PRICING & COSTING */}
        <div style={{ borderTop: `1px solid #eee`, paddingTop: '20px', marginBottom: '50px', pageBreakBefore: 'always' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ width: '6px', height: '28px', backgroundColor: primaryColor, borderRadius: '4px' }}></div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: sectionTitleColor, margin: 0 }}>Tour Package Pricing</h3>
          </div>
          <div style={{ maxWidth: '650px', margin: '0 0' }}>
            <CostRow label="Total Travelers" value={`${data.pricing?.totalPax} PAX`} />
            <CostRow label="Adult Guest" value={data.pricing?.adults} />
            {data.pricing?.roomType && (
              <CostRow label="Room Category" value={data.pricing.roomType} />
            )}
            <CostRow label="No of Rooms" value={data.pricing?.rooms} />
            {data.pricing?.extraBeds > 0 && (
              <CostRow label={`Extra Bed (${data.pricing.extraBeds})`} value={data.pricing.extraBedPrice} />
            )}
            {data.pricing?.cnbCount > 0 && (
              <CostRow label={`Child No Bed (${data.pricing.cnbCount})`} value={data.pricing.cnbPrice} />
            )}
            <CostRow label="Child" value={data.pricing?.children} />
            <CostRow label="Per Adult Cost" value={data.pricing?.perAdultPrice} />
            <CostRow label="Total Package Cost" value={data.pricing?.totalCost} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', marginTop: '40px' }}>
            <div style={{ width: '6px', height: '28px', backgroundColor: primaryColor, borderRadius: '4px' }}></div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: sectionTitleColor, margin: 0 }}>Route Schedule</h3>
          </div>
          <div style={{ maxWidth: '650px', margin: '0 0' }}>
            {data.pricing?.nightBreakup?.map((item, idx) => (
              <CostRow key={idx} label={item.destination} value={String(item.nights)} />
            ))}
          </div>
        </div>

        <PolicyBox title="Inclusion" items={data.inclusions || []} bgColor="#F1F1F1" accentColor="#E5E5E5" />
        <PolicyBox title="Excludes" items={data.exclusions || []} bgColor="#FF8C42" accentColor="#F56C0A" textColorOverride="#000" />
        <PolicyBox title="Supplement Cost" items={data.supplementCosts || []} bgColor="#FFCC33" accentColor="#EAB308" textColorOverride="#000" />
        <PolicyBox title="Terms & Conditions" items={data.terms || []} bgColor="#E5E7EB" accentColor="#D1D5DB" />
        <PolicyBox title="Cancellation Policy" items={data.cancellationPolicy || []} bgColor="#E5E7EB" accentColor="#D1D5DB" />
      </div>

      {/* FINAL PAGE */}
      <section className="relative w-full h-[296mm] overflow-hidden" style={{ background: primaryColor, pageBreakBefore: 'always' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
          <img src="../images/kashmir-bottom.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Travel Background" />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, transparent 20%, ${primaryColor} 90%)` }}></div>

        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ marginBottom: '100px', textAlign: 'center' }}>
            {renderLogo('light', 'lg')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '530px' }}>
            {(branding?.officeLocations && branding.officeLocations.length > 0 ? branding.officeLocations : branding?.locations || ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonmarg']).map((loc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <div style={{
                  width: '75px',
                  height: '75px',
                  backgroundColor: highlightColor,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '5px solid #fff',
                  zIndex: 2,
                  // boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}>
                  <MapPin size={38} color="#fff" fill="#fff" />
                </div>
                <div style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  padding: '18px 30px 18px 50px',
                  borderRadius: '0 40px 40px 0',
                  marginLeft: '-37px',
                  zIndex: 1,
                  // boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#000' }}>{loc}</span>
                </div>
              </div>
            ))}
          </div>


          <div style={{ position: 'absolute', bottom: '40px', width: '100%', padding: '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>


            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
              24x7 Helpline : {branding?.helpline || branding?.phone}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
