import React from "react";
import {
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import {
  dateRange,
  formatTelegram,
  hasText,
  languageLabel,
  type TemplatePdfProps,
} from "../types";

// Clean vector icons for the Designer template
const PhoneIcon = () => (
  <Svg width={9} height={9} viewBox="0 0 24 24">
    <Path
      fill="#111827"
      d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"
    />
  </Svg>
);

const MailIcon = () => (
  <Svg width={9} height={9} viewBox="0 0 24 24">
    <Path
      fill="#111827"
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
    />
  </Svg>
);

const PinIcon = () => (
  <Svg width={9} height={9} viewBox="0 0 24 24">
    <Path
      fill="#111827"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
    />
  </Svg>
);

const TelegramIcon = () => (
  <Svg width={9} height={9} viewBox="0 0 24 24">
    <Path
      fill="#111827"
      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
    />
  </Svg>
);

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 32,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },

  // Top Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
  },
  photoContainer: {
    width: 76,
    height: 96,
    overflow: "hidden",
    marginRight: 18,
    backgroundColor: "#2563eb",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  initialsBox: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  initialsText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: "#ffffff",
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  fullName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 26,
    lineHeight: 1.2,
    color: "#1f2937",
    letterSpacing: -0.3,
  },
  roleApplied: {
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.3,
    color: "#1f2937",
    marginTop: 4,
  },

  // Body Layout
  body: {
    flexDirection: "row",
  },
  leftColumn: {
    width: "38%",
    paddingRight: 14,
    borderRightWidth: 0.75,
    borderRightColor: "#d1d5db",
  },
  rightColumn: {
    width: "62%",
    paddingLeft: 16,
  },

  // Section Typography (tracked uppercase with colon)
  sectionHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    lineHeight: 1.2,
    color: "#111827",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 7,
  },
  sideSection: {
    marginBottom: 12,
  },
  mainSection: {
    marginBottom: 12,
  },

  // Contact Items
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4.5,
  },
  contactIcon: {
    width: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    flexShrink: 0,
  },
  contactText: {
    fontSize: 8,
    lineHeight: 1.3,
    color: "#1f2937",
    textDecoration: "none",
    flex: 1,
  },

  // Bullet Lists
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 8,
    lineHeight: 1.35,
    color: "#111827",
    flexShrink: 0,
  },
  bulletContent: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.35,
    color: "#1f2937",
  },

  // Education Items
  eduItem: {
    marginBottom: 7,
  },
  eduSchool: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    lineHeight: 1.25,
    color: "#111827",
    textTransform: "uppercase",
  },
  eduMeta: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    lineHeight: 1.3,
    color: "#374151",
    marginTop: 1,
  },
  eduDegree: {
    fontFamily: "Helvetica",
    fontSize: 8,
    lineHeight: 1.3,
    color: "#4b5563",
    marginTop: 1,
  },

  // Experience Items
  expItem: {
    marginBottom: 9,
  },
  expRoleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    marginBottom: 1,
  },
  expRoleTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    lineHeight: 1.25,
    color: "#111827",
    textTransform: "uppercase",
  },
  expCompany: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    lineHeight: 1.25,
    color: "#1f2937",
    marginBottom: 3,
  },

  // Tech Stack / Projects Items
  techStackLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },

  // Confirmation Section
  confirmationParagraph: {
    fontFamily: "Helvetica",
    fontSize: 8,
    lineHeight: 1.45,
    color: "#1f2937",
  },
});

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CV";
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || "CV";
  return (
    (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
  ).toUpperCase();
}

export function DesignerPdf({ document }: TemplatePdfProps) {
  const { personal } = document;
  const fullName = personal.fullName.trim() || "Your Name";
  const initials = getInitials(personal.fullName);
  const hasPhoto = hasText(personal.photoUrl);

  const experience = document.experience.filter(
    (e) =>
      hasText(e.company) ||
      hasText(e.role) ||
      e.bullets.some((b) => hasText(b.text))
  );
  const education = document.education.filter(
    (e) => hasText(e.school) || hasText(e.degree) || hasText(e.field)
  );
  const skills = document.skills.filter((s) => hasText(s.name));
  const projects = document.projects.filter(
    (p) =>
      hasText(p.name) ||
      hasText(p.description) ||
      p.bullets.some((b) => hasText(b.text))
  );
  const languages = document.languages.filter((l) => hasText(l.name));

  // Determine confirmation text
  const confirmationText = hasText(document.summary)
    ? document.summary.trim()
    : hasText(personal.fullName)
    ? `I am ${personal.fullName.trim()}. I would like to declare that all the information given in this Curriculum Vitae is completely correct. If there is any false information. I will take my responsibility for everything on my CV.`
    : "";

  return (
    <Page size="A4" style={styles.page}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          {hasPhoto ? (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={personal.photoUrl} style={styles.photo} />
          ) : (
            <View style={styles.initialsBox}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.fullName}>{fullName}</Text>
          {hasText(personal.roleApplied) && (
            <Text style={styles.roleApplied}>
              Apply for: {personal.roleApplied.trim()}
            </Text>
          )}
        </View>
      </View>

      {/* Main Two-Column Layout */}
      <View style={styles.body}>
        {/* Left Column (38%) */}
        <View style={styles.leftColumn}>
          {/* Contact Section */}
          {(hasText(personal.phone) ||
            hasText(personal.email) ||
            hasText(personal.location) ||
            hasText(personal.telegram) ||
            hasText(personal.website) ||
            hasText(personal.linkedin) ||
            hasText(personal.github)) && (
            <View style={styles.sideSection} wrap={false}>
              <Text style={styles.sectionHeading}>C O N T A C T :</Text>

              {hasText(personal.phone) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <PhoneIcon />
                  </View>
                  <Text style={styles.contactText}>{personal.phone.trim()}</Text>
                </View>
              )}

              {hasText(personal.email) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <MailIcon />
                  </View>
                  <Link
                    src={`mailto:${personal.email.trim()}`}
                    style={styles.contactText}
                  >
                    {personal.email.trim()}
                  </Link>
                </View>
              )}

              {hasText(personal.location) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <PinIcon />
                  </View>
                  <Text style={styles.contactText}>{personal.location.trim()}</Text>
                </View>
              )}

              {hasText(personal.telegram) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <TelegramIcon />
                  </View>
                  <Link
                    src={formatTelegram(personal.telegram).url}
                    style={styles.contactText}
                  >
                    {personal.telegram.trim().startsWith("@")
                      ? personal.telegram.trim()
                      : `@${formatTelegram(personal.telegram).label.replace("t.me/", "")}`}
                  </Link>
                </View>
              )}

              {hasText(personal.website) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <Text style={{ fontSize: 8 }}>🌐</Text>
                  </View>
                  <Link
                    src={
                      personal.website.startsWith("http")
                        ? personal.website
                        : `https://${personal.website}`
                    }
                    style={styles.contactText}
                  >
                    {personal.website.trim().replace(/^https?:\/\//i, "")}
                  </Link>
                </View>
              )}

              {hasText(personal.linkedin) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}>in</Text>
                  </View>
                  <Link
                    src={
                      personal.linkedin.startsWith("http")
                        ? personal.linkedin
                        : `https://${personal.linkedin}`
                    }
                    style={styles.contactText}
                  >
                    {personal.linkedin
                      .trim()
                      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")}
                  </Link>
                </View>
              )}

              {hasText(personal.github) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}>gh</Text>
                  </View>
                  <Link
                    src={
                      personal.github.startsWith("http")
                        ? personal.github
                        : `https://${personal.github}`
                    }
                    style={styles.contactText}
                  >
                    {personal.github
                      .trim()
                      .replace(/^https?:\/\/(www\.)?github\.com\//i, "")}
                  </Link>
                </View>
              )}
            </View>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <View style={styles.sideSection} wrap={false}>
              <Text style={styles.sectionHeading}>S K I L L S :</Text>
              {skills.map((s) => (
                <View key={s.id} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletContent}>{s.name.trim()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sectionHeading}>E D U C A T I O N :</Text>
              {education.map((entry) => {
                const dates = dateRange(entry.startDate, entry.endDate);
                const fieldFormatted = entry.field
                  ? entry.field.trim().startsWith("(") && entry.field.trim().endsWith(")")
                    ? entry.field.trim()
                    : `(${entry.field.trim()})`
                  : "";
                const metaLine = [dates, fieldFormatted]
                  .filter(Boolean)
                  .join(" | ");

                return (
                  <View key={entry.id} style={styles.eduItem} wrap={false}>
                    <Text style={styles.eduSchool}>
                      {entry.school.trim() || "University / School"}
                    </Text>
                    {metaLine ? <Text style={styles.eduMeta}>{metaLine}</Text> : null}
                    {hasText(entry.degree) && (
                      <Text style={styles.eduDegree}>{entry.degree.trim()}</Text>
                    )}
                    {hasText(entry.details) && (
                      <Text style={styles.eduDegree}>{entry.details.trim()}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Language Section */}
          {languages.length > 0 && (
            <View style={styles.sideSection} wrap={false}>
              <Text style={styles.sectionHeading}>L A N G U A G E :</Text>
              {languages.map((l) => (
                <View key={l.id} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletContent}>
                    {languageLabel(l.name, l.proficiency)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Column (62%) */}
        <View style={styles.rightColumn}>
          {/* Experience Section */}
          {experience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.sectionHeading}>E X P E R I E N C E :</Text>
              {experience.map((entry) => {
                const bullets = entry.bullets.filter((b) => hasText(b.text));
                const dates = dateRange(
                  entry.startDate,
                  entry.endDate,
                  entry.current
                );
                const roleDateLine = [entry.role.trim() || "Role", dates]
                  .filter(Boolean)
                  .join(" | ");

                return (
                  <View key={entry.id} style={styles.expItem} wrap={false}>
                    <View style={styles.expRoleRow}>
                      <Text style={styles.expRoleTitle}>{roleDateLine}</Text>
                    </View>

                    {hasText(entry.company) && (
                      <Text style={styles.expCompany}>
                        {[entry.company.trim(), entry.location.trim()]
                          .filter(Boolean)
                          .join(" - ")}
                      </Text>
                    )}

                    {bullets.length > 0 && (
                      <View>
                        {bullets.map((b) => (
                          <View key={b.id} style={styles.bulletItem}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletContent}>{b.text.trim()}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Tech Stack / Key Projects Section */}
          {projects.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.sectionHeading}>T E C H   S T A C K :</Text>
              {projects.map((p) => {
                const bullets = p.bullets.filter((b) => hasText(b.text));
                const desc = p.description.trim();

                return (
                  <View key={p.id} style={styles.bulletItem} wrap={false}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletContent}>
                      <Text style={styles.techStackLabel}>
                        {p.name.trim() ? `${p.name.trim()}: ` : ""}
                      </Text>
                      {desc ? desc : ""}
                      {bullets.length > 0 ? ` ${bullets.map((b) => b.text.trim()).join("; ")}` : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Confirmation / Declaration Section */}
          {hasText(confirmationText) && (
            <View style={styles.mainSection} wrap={false}>
              <Text style={styles.sectionHeading}>C O N F I R M A T I O N :</Text>
              <Text style={styles.confirmationParagraph}>
                {confirmationText}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}
