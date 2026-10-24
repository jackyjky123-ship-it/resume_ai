import React from "react";
import { Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import {
  dateRange,
  formatTelegram,
  hasText,
  type TemplatePdfProps,
} from "../types";

const ACCENT_COLOR = "#3b6998"; // Slate blue accent from reference image

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 30,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    lineHeight: 1.35,
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  body: {
    flexDirection: "row",
  },
  sidebar: {
    width: "36%",
    paddingRight: 14,
  },
  main: {
    width: "64%",
    paddingLeft: 10,
  },

  // Name Header in Right Column
  nameContainer: {
    marginBottom: 8,
  },
  nameText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    lineHeight: 1.2,
    color: "#0f172a",
  },
  nameLast: {
    color: ACCENT_COLOR,
  },
  roleApplied: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    lineHeight: 1.2,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Profile Photo / Avatar Frame
  photoContainer: {
    width: "100%",
    height: 200,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "top",
  },
  initialsBox: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#cbd5e1",
  },
  initialsText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: "#64748b",
  },

  // Headings
  sidebarHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#0f172a",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: 2,
    marginBottom: 6,
  },
  mainHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#0f172a",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: 2,
    marginBottom: 6,
  },
  skillHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#0f172a",
    marginBottom: 4,
  },

  // Contact items
  contactBlock: {
    marginBottom: 6,
  },
  contactLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#0f172a",
    marginBottom: 1,
  },
  contactValue: {
    fontSize: 7.8,
    color: "#475569",
    textDecoration: "none",
  },

  // Languages
  langItem: {
    fontSize: 8,
    color: "#1e293b",
    marginBottom: 2.5,
    fontFamily: "Helvetica",
  },

  // Projects in sidebar
  sidebarProject: {
    marginBottom: 5,
  },
  sidebarProjectTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#0f172a",
  },
  sidebarProjectDesc: {
    fontSize: 7.5,
    color: "#475569",
  },

  // Skill Highlights Dashed Box
  skillHighlightsBox: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#f8fafc",
    marginBottom: 8,
  },
  skillColumns: {
    flexDirection: "row",
  },
  skillColumn: {
    width: "50%",
    paddingRight: 4,
  },
  skillBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2.5,
  },
  bulletSymbol: {
    fontSize: 8,
    color: "#0f172a",
    marginRight: 4,
    fontFamily: "Helvetica-Bold",
  },
  skillBulletText: {
    flex: 1,
    fontSize: 8,
    color: "#1e293b",
    fontFamily: "Helvetica",
  },

  // Experience
  entry: {
    marginBottom: 7,
  },
  entryTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    marginBottom: 1,
  },
  entryRole: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#0f172a",
  },
  entryDates: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#475569",
  },
  entrySubtitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#334155",
    marginBottom: 2,
  },
  bulletList: {
    paddingLeft: 4,
    marginTop: 1,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 1.5,
  },
  bulletPoint: {
    width: 7,
    fontSize: 8,
    color: "#0f172a",
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.3,
  },

  // Education
  eduDegree: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#0f172a",
  },
  eduSchool: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#334155",
    marginTop: 1,
  },
  eduDetails: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 1,
  },

  // Certifications
  certItem: {
    fontSize: 8,
    color: "#334155",
    marginBottom: 2.5,
  },
  certName: {
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },

  // Paragraph
  paragraph: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: "#334155",
    marginBottom: 8,
  },
});

function splitName(fullName: string): { first: string; last: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { first: "Your", last: "Name" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0] ?? "", last: "" };
  }
  const last = parts.pop() ?? "";
  const first = parts.join(" ");
  return { first, last };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CV";
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || "CV";
  return (
    (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
  ).toUpperCase();
}

export function EditorialPdf({ document }: TemplatePdfProps) {
  const { first, last } = splitName(document.personal.fullName);
  const initials = getInitials(document.personal.fullName);
  const hasPhoto = hasText(document.personal.photoUrl);

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
  const certifications = document.certifications.filter(
    (c) => hasText(c.name) || hasText(c.issuer)
  );
  const languages = document.languages.filter((l) => hasText(l.name));
  const references = (document.references ?? []).filter(
    (r) =>
      hasText(r.name) ||
      hasText(r.position) ||
      hasText(r.workplace) ||
      hasText(r.email) ||
      hasText(r.phone)
  );

  // Split skills into two columns for the highlight box
  const half = Math.ceil(skills.length / 2);
  const skillCol1 = skills.slice(0, half);
  const skillCol2 = skills.slice(half);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.body}>
        {/* Left Sidebar (35% width) */}
        <View style={styles.sidebar}>

          {/* Photo Frame */}
          <View style={styles.photoContainer}>
            {hasPhoto ? (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={document.personal.photoUrl} style={styles.photo} />
            ) : (
              <View style={styles.initialsBox}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            )}
          </View>

          {/* Contact Section */}
          {(hasText(document.personal.location) ||
            hasText(document.personal.phone) ||
            hasText(document.personal.email) ||
            hasText(document.personal.linkedin) ||
            hasText(document.personal.website) ||
            hasText(document.personal.github) ||
            hasText(document.personal.telegram)) && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sidebarHeading}>Contact</Text>

              {hasText(document.personal.location) && (
                <View style={styles.contactBlock}>
                  <Text style={styles.contactLabel}>Address:</Text>
                  <Text style={styles.contactValue}>
                    {document.personal.location.trim()}
                  </Text>
                </View>
              )}

              {hasText(document.personal.phone) && (
                <View style={styles.contactBlock}>
                  <Text style={styles.contactLabel}>Phone:</Text>
                  <Text style={styles.contactValue}>
                    {document.personal.phone.trim()}
                  </Text>
                </View>
              )}

              {hasText(document.personal.email) && (
                <View style={styles.contactBlock}>
                  <Text style={styles.contactLabel}>Email:</Text>
                  <Link
                    src={`mailto:${document.personal.email.trim()}`}
                    style={styles.contactValue}
                  >
                    {document.personal.email.trim()}
                  </Link>
                </View>
              )}

              {hasText(document.personal.linkedin) && (
                <View style={styles.contactBlock}>
                  <Text style={styles.contactLabel}>LinkedIn:</Text>
                  <Link
                    src={
                      document.personal.linkedin.startsWith("http")
                        ? document.personal.linkedin
                        : `https://${document.personal.linkedin}`
                    }
                    style={styles.contactValue}
                  >
                    {document.personal.linkedin
                      .trim()
                      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "linkedin.com/")
                      .replace(/^https?:\/\/(www\.)?linkedin\.com\//i, "linkedin.com/")}
                  </Link>
                </View>
              )}

              {hasText(document.personal.website) && (
                <View style={styles.contactBlock}>
                  <Text style={styles.contactLabel}>Website:</Text>
                  <Link
                    src={
                      document.personal.website.startsWith("http")
                        ? document.personal.website
                        : `https://${document.personal.website}`
                    }
                    style={styles.contactValue}
                  >
                    {document.personal.website.trim().replace(/^https?:\/\//i, "")}
                  </Link>
                </View>
              )}

              {hasText(document.personal.github) && (
                <View style={styles.contactBlock}>
                  <Text style={styles.contactLabel}>GitHub:</Text>
                  <Link
                    src={
                      document.personal.github.startsWith("http")
                        ? document.personal.github
                        : `https://${document.personal.github}`
                    }
                    style={styles.contactValue}
                  >
                    {document.personal.github
                      .trim()
                      .replace(/^https?:\/\/(www\.)?github\.com\//i, "github.com/")}
                  </Link>
                </View>
              )}

              {hasText(document.personal.telegram) && (
                <View style={styles.contactBlock}>
                  <Text style={styles.contactLabel}>Telegram:</Text>
                  <Link
                    src={formatTelegram(document.personal.telegram).url}
                    style={styles.contactValue}
                  >
                    {formatTelegram(document.personal.telegram).label}
                  </Link>
                </View>
              )}
            </View>
          )}

          {/* Languages Section */}
          {languages.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sidebarHeading}>Languages</Text>
              {languages.map((l) => (
                <Text key={l.id} style={styles.langItem}>
                  {l.name.trim()}
                  {hasText(l.proficiency) ? ` – ${l.proficiency.trim()}` : ""}
                </Text>
              ))}
            </View>
          )}

          {/* Projects in Sidebar */}
          {projects.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sidebarHeading}>Projects</Text>
              {projects.map((p) => (
                <View key={p.id} style={styles.sidebarProject}>
                  <Text style={styles.sidebarProjectTitle}>
                    {p.name.trim() || "Project"}
                  </Text>
                  {hasText(p.description) && (
                    <Text style={styles.sidebarProjectDesc}>
                      {p.description.trim()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Main Column (65% width) */}
        <View style={styles.main}>
          {/* Two-tone Name & Role */}
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>
              {first}
              {last ? (
                <Text style={styles.nameLast}> {last}</Text>
              ) : null}
            </Text>
            {hasText(document.personal.roleApplied) && (
              <Text style={styles.roleApplied}>
                {document.personal.roleApplied.trim()}
              </Text>
            )}
          </View>

          {/* Summary Section */}
          {hasText(document.summary) && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.mainHeading}>Summary</Text>
              <Text style={styles.paragraph}>{document.summary.trim()}</Text>
            </View>
          )}

          {/* Skill Highlights (Dashed border box with 2-column bullets) */}
          {skills.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.skillHeading}>Skill Highlights</Text>
              <View style={styles.skillHighlightsBox}>
                <View style={styles.skillColumns}>
                  {/* Column 1 */}
                  <View style={styles.skillColumn}>
                    {skillCol1.map((s) => (
                      <View key={s.id} style={styles.skillBulletRow}>
                        <Text style={styles.bulletSymbol}>•</Text>
                        <Text style={styles.skillBulletText}>{s.name.trim()}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Column 2 */}
                  <View style={styles.skillColumn}>
                    {skillCol2.map((s) => (
                      <View key={s.id} style={styles.skillBulletRow}>
                        <Text style={styles.bulletSymbol}>•</Text>
                        <Text style={styles.skillBulletText}>{s.name.trim()}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Experience Section */}
          {experience.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.mainHeading}>Experience</Text>
              {experience.map((entry) => {
                const bullets = entry.bullets.filter((b) => hasText(b.text));
                const dates = dateRange(
                  entry.startDate,
                  entry.endDate,
                  entry.current
                );
                return (
                  <View key={entry.id} style={styles.entry}>
                    <View style={styles.entryTitleRow}>
                      <Text style={styles.entryRole}>
                        {entry.role.trim() || "Role"}
                      </Text>
                      {dates ? (
                        <Text style={styles.entryDates}>{" - " + dates}</Text>
                      ) : null}
                    </View>

                    {(hasText(entry.company) || hasText(entry.location)) && (
                      <Text style={styles.entrySubtitle}>
                        {[entry.company.trim(), entry.location.trim()]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    )}

                    {bullets.length > 0 && (
                      <View style={styles.bulletList}>
                        {bullets.map((b) => (
                          <View key={b.id} style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>{b.text.trim()}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.mainHeading}>Education</Text>
              {education.map((entry) => {
                const dates = dateRange(entry.startDate, entry.endDate);
                return (
                  <View key={entry.id} style={{ marginBottom: 6 }}>
                    <Text style={styles.eduDegree}>
                      {hasText(entry.degree) ? `${entry.degree.trim()}: ` : ""}
                      {hasText(entry.field) ? entry.field.trim() : ""}
                      {dates ? ` - ${dates}` : ""}
                    </Text>
                    {(hasText(entry.school) || hasText(entry.location)) && (
                      <Text style={styles.eduSchool}>
                        {[entry.school.trim(), entry.location.trim()]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    )}
                    {hasText(entry.details) && (
                      <Text style={styles.eduDetails}>{entry.details.trim()}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Certifications Section */}
          {certifications.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.mainHeading}>Certifications</Text>
              {certifications.map((entry) => (
                <Text key={entry.id} style={styles.certItem}>
                  <Text style={styles.certName}>{entry.name.trim()}</Text>
                  {hasText(entry.issuer) ? `: ${entry.issuer.trim()}` : ""}
                  {hasText(entry.issueDate) ? ` - ${entry.issueDate.trim()}` : ""}
                </Text>
              ))}
            </View>
          )}
          {/* References Section */}
          {references.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.mainHeading}>References</Text>
              {references.map((entry) => (
                <View key={entry.id} style={styles.entry} wrap={false}>
                  <Text style={styles.eduDegree}>
                    {[entry.name.trim(), entry.position.trim()]
                      .filter(Boolean)
                      .join(" — ")}
                  </Text>
                  {[entry.workplace, entry.email, entry.phone]
                    .filter(hasText)
                    .length > 0 && (
                    <Text style={styles.eduDetails}>
                      {[entry.workplace, entry.email, entry.phone]
                        .filter(hasText)
                        .map((value) => value.trim())
                        .join("  ·  ")}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}
