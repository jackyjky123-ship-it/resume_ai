import React from "react";
import {
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
} from "@react-pdf/renderer";
import {
  dateRange,
  formatTelegram,
  hasText,
  type TemplatePdfProps,
} from "../types";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CV";
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || "CV";
  return (
    (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
  ).toUpperCase();
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#FAF9F6",
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#1f2937",
    padding: 0,
  },

  // Left Sidebar (36% width)
  leftColumn: {
    width: "36%",
    backgroundColor: "#1E2532",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
    color: "#ffffff",
  },

  // Avatar
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00A3E0",
    backgroundColor: "#00A3E0",
    alignSelf: "center",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "top",
  },
  initialsText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: "#ffffff",
  },

  // Left Section Typography
  sideSection: {
    marginBottom: 12,
  },
  sideHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#ffffff",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    paddingBottom: 3,
    marginBottom: 5,
    borderBottomWidth: 0.75,
    borderBottomColor: "rgba(255,255,255,0.4)",
  },
  sideRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3.5,
  },
  sideDot: {
    width: 8,
    fontSize: 7.5,
    color: "#00A3E0",
    fontFamily: "Helvetica-Bold",
  },
  sideText: {
    flex: 1,
    fontSize: 7.5,
    lineHeight: 1.35,
    color: "#f1f5f9",
  },
  sideLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  sideLink: {
    color: "#f1f5f9",
    textDecoration: "none",
  },

  // Right Column (64% width)
  rightColumn: {
    width: "64%",
    backgroundColor: "#FAF9F6",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    marginBottom: 10,
  },
  fullName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 21,
    lineHeight: 1.15,
    color: "#1E2532",
    textTransform: "uppercase",
    letterSpacing: -0.2,
  },
  roleApplied: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.3,
    color: "#374151",
    marginTop: 3,
  },
  roleHighlight: {
    fontFamily: "Helvetica-Bold",
    color: "#1E2532",
  },

  // Pill Section Banners
  pillBanner: {
    backgroundColor: "#1E2532",
    borderRadius: 7,
    paddingVertical: 3.5,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    marginTop: 3,
  },
  pillText: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  mainSection: {
    marginBottom: 10,
  },

  // Body content
  bodyText: {
    fontSize: 7.8,
    lineHeight: 1.4,
    color: "#1f2937",
  },

  // Bullet items
  mainBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  mainBulletDot: {
    width: 8,
    fontSize: 7.5,
    color: "#1E2532",
    fontFamily: "Helvetica-Bold",
  },
  mainBulletText: {
    flex: 1,
    fontSize: 7.8,
    lineHeight: 1.35,
    color: "#1f2937",
  },

  // Technical skills 2-column grid
  skillsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skillsCol: {
    width: "48%",
  },
  skillsColTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.8,
    color: "#1E2532",
    marginBottom: 3,
  },

  // Project & Experience
  itemTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.2,
    color: "#1E2532",
    marginBottom: 1.5,
  },
  itemSubtitle: {
    fontSize: 7.5,
    color: "#4b5563",
    marginBottom: 2,
  },
});

export function NavyPdf({ document }: TemplatePdfProps) {
  const { personal } = document;
  const fullName = personal.fullName.trim() || "Reth Sreyroth";
  const initials = getInitials(personal.fullName);
  const hasPhoto = hasText(personal.photoUrl);

  const experience = document.experience.filter(
    (entry) =>
      hasText(entry.company) ||
      hasText(entry.role) ||
      entry.bullets.some((b) => hasText(b.text))
  );
  const education = document.education.filter(
    (entry) =>
      hasText(entry.school) || hasText(entry.degree) || hasText(entry.field)
  );
  const skills = document.skills.filter((entry) => hasText(entry.name));
  const projects = document.projects.filter(
    (entry) =>
      hasText(entry.name) ||
      hasText(entry.description) ||
      entry.bullets.some((b) => hasText(b.text))
  );
  const languages = document.languages.filter((entry) => hasText(entry.name));
  const references = (document.references ?? []).filter(
    (entry) =>
      hasText(entry.name) ||
      hasText(entry.position) ||
      hasText(entry.workplace) ||
      hasText(entry.email)
  );
  const certifications = document.certifications.filter(
    (entry) => hasText(entry.name) || hasText(entry.issuer)
  );

  const hasAnyContact =
    hasText(personal.phone) ||
    hasText(personal.email) ||
    hasText(personal.telegram) ||
    hasText(personal.website) ||
    hasText(personal.linkedin) ||
    hasText(personal.github);

  const hasPersonalInfo =
    hasText(personal.fullName) ||
    hasText(personal.gender) ||
    hasText(personal.nationality) ||
    hasText(personal.dateOfBirth) ||
    hasText(personal.placeOfBirth) ||
    hasText(personal.location);

  const rawStrengths = personal.strengths?.trim();
  const strengthsList = rawStrengths
    ? rawStrengths
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        "Fast learner",
        "Responsible and hardworking",
        "Good teamwork skills",
      ];

  const half = Math.ceil(skills.length / 2);
  const skillsCol1 = skills.slice(0, half);
  const skillsCol2 = skills.slice(half);

  return (
    <Page size="A4" style={styles.page}>
      {/* ============================================================== */}
      {/* LEFT SIDEBAR: Dark Navy                                        */}
      {/* ============================================================== */}
      <View style={styles.leftColumn}>
        {/* Profile Avatar with Sky/Cyan Ring */}
        <View style={styles.photoContainer}>
          {hasPhoto ? (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={personal.photoUrl} style={styles.photo} />
          ) : (
            <Text style={styles.initialsText}>{initials}</Text>
          )}
        </View>

        {/* CONTACT SECTION */}
        {hasAnyContact && (
          <View style={styles.sideSection}>
            <Text style={styles.sideHeading}>CONTACT</Text>
            {hasText(personal.phone) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>Phone : </Text>
                  {personal.phone.trim()}
                </Text>
              </View>
            )}
            {hasText(personal.email) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>Email : </Text>
                  <Link
                    src={`mailto:${personal.email.trim()}`}
                    style={styles.sideLink}
                  >
                    {personal.email.trim()}
                  </Link>
                </Text>
              </View>
            )}
            {hasText(personal.telegram) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>Telegram : </Text>
                  <Link
                    src={formatTelegram(personal.telegram).url}
                    style={styles.sideLink}
                  >
                    {personal.telegram.trim().startsWith("@")
                      ? personal.telegram.trim()
                      : `@${formatTelegram(personal.telegram).label.replace("t.me/", "")}`}
                  </Link>
                </Text>
              </View>
            )}
            {hasText(personal.website) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>Website : </Text>
                  <Link
                    src={
                      personal.website.startsWith("http")
                        ? personal.website
                        : `https://${personal.website}`
                    }
                    style={styles.sideLink}
                  >
                    {personal.website.trim().replace(/^https?:\/\//i, "")}
                  </Link>
                </Text>
              </View>
            )}
            {hasText(personal.linkedin) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>LinkedIn : </Text>
                  {personal.linkedin
                    .trim()
                    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")}
                </Text>
              </View>
            )}
            {hasText(personal.github) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>GitHub : </Text>
                  {personal.github.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* PERSONAL INFORMATION SECTION */}
        {hasPersonalInfo && (
          <View style={styles.sideSection}>
            <Text style={styles.sideHeading}>PERSONAL INFORMATION</Text>
            <View style={styles.sideRow}>
              <Text style={styles.sideDot}>•</Text>
              <Text style={styles.sideText}>
                <Text style={styles.sideLabel}>Full Name : </Text>
                {fullName}
              </Text>
            </View>
            {hasText(personal.gender) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>Gender : </Text>
                  {personal.gender.trim()}
                </Text>
              </View>
            )}
            {hasText(personal.nationality) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>Nationality : </Text>
                  {personal.nationality.trim()}
                </Text>
              </View>
            )}
            {hasText(personal.dateOfBirth) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>Date of Birth : </Text>
                  {personal.dateOfBirth.trim()}
                </Text>
              </View>
            )}
            {(hasText(personal.placeOfBirth) || hasText(personal.location)) && (
              <View style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>Place of Birth : </Text>
                  {(personal.placeOfBirth || personal.location).trim()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* LANGUAGES SECTION */}
        {languages.length > 0 && (
          <View style={styles.sideSection}>
            <Text style={styles.sideHeading}>LANGUAGES</Text>
            {languages.map((lang) => (
              <View key={lang.id} style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>
                  <Text style={styles.sideLabel}>{lang.name.trim()}</Text>
                  {hasText(lang.proficiency) && `: ${lang.proficiency.trim()}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* STRENGTHS SECTION */}
        {strengthsList.length > 0 && (
          <View style={styles.sideSection}>
            <Text style={styles.sideHeading}>STRENGTHS</Text>
            {strengthsList.map((item, idx) => (
              <View key={idx} style={styles.sideRow}>
                <Text style={styles.sideDot}>•</Text>
                <Text style={styles.sideText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ============================================================== */}
      {/* RIGHT MAIN COLUMN: Off-White                                   */}
      {/* ============================================================== */}
      <View style={styles.rightColumn}>
        {/* Name Header */}
        <View style={styles.header}>
          <Text style={styles.fullName}>{fullName}</Text>
          {hasText(personal.roleApplied) && (
            <Text style={styles.roleApplied}>
              Apply for:{" "}
              <Text style={styles.roleHighlight}>
                {personal.roleApplied.trim()}
              </Text>
            </Text>
          )}
        </View>

        {/* ABOUT ME SECTION */}
        {hasText(document.summary) && (
          <View style={styles.mainSection}>
            <View style={styles.pillBanner}>
              <Text style={styles.pillText}>ABOUT ME</Text>
            </View>
            <Text style={styles.bodyText}>{document.summary.trim()}</Text>
          </View>
        )}

        {/* EDUCATION SECTION */}
        {education.length > 0 && (
          <View style={styles.mainSection}>
            <View style={styles.pillBanner}>
              <Text style={styles.pillText}>EDUCATION</Text>
            </View>
            {education.map((entry) => {
              const dates = dateRange(entry.startDate, entry.endDate, false);
              return (
                <View key={entry.id} style={styles.mainBulletRow}>
                  <Text style={styles.mainBulletDot}>•</Text>
                  <Text style={styles.mainBulletText}>
                    {dates && (
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        {dates}:{" "}
                      </Text>
                    )}
                    {[entry.degree, entry.field].filter(Boolean).join(" in ")}
                    {entry.school && ` at ${entry.school.trim()}`}
                    {hasText(entry.details) && ` — ${entry.details.trim()}`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* TECHNICAL SKILLS SECTION (2 Columns) */}
        {skills.length > 0 && (
          <View style={styles.mainSection}>
            <View style={styles.pillBanner}>
              <Text style={styles.pillText}>TECHNICAL SKILLS</Text>
            </View>
            <View style={styles.skillsGrid}>
              <View style={styles.skillsCol}>
                <Text style={styles.skillsColTitle}>Programming Languages</Text>
                {skillsCol1.map((skill) => (
                  <View key={skill.id} style={styles.mainBulletRow}>
                    <Text style={styles.mainBulletDot}>•</Text>
                    <Text style={styles.mainBulletText}>{skill.name.trim()}</Text>
                  </View>
                ))}
              </View>

              {skillsCol2.length > 0 && (
                <View style={styles.skillsCol}>
                  <Text style={styles.skillsColTitle}>Web Development</Text>
                  {skillsCol2.map((skill) => (
                    <View key={skill.id} style={styles.mainBulletRow}>
                      <Text style={styles.mainBulletDot}>•</Text>
                      <Text style={styles.mainBulletText}>{skill.name.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ACADEMIC PROJECT SECTION */}
        {projects.length > 0 && (
          <View style={styles.mainSection}>
            <View style={styles.pillBanner}>
              <Text style={styles.pillText}>ACADEMIC PROJECT</Text>
            </View>
            {projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 6 }}>
                <Text style={styles.itemTitle}>{proj.name.trim()}</Text>
                {hasText(proj.description) && (
                  <Text style={styles.itemSubtitle}>{proj.description.trim()}</Text>
                )}
                {proj.bullets
                  .filter((b) => hasText(b.text))
                  .map((b) => (
                    <View key={b.id} style={styles.mainBulletRow}>
                      <Text style={styles.mainBulletDot}>•</Text>
                      <Text style={styles.mainBulletText}>{b.text.trim()}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        )}

        {/* WORK EXPERIENCE SECTION */}
        {experience.length > 0 && (
          <View style={styles.mainSection}>
            <View style={styles.pillBanner}>
              <Text style={styles.pillText}>WORK EXPERIENCE</Text>
            </View>
            {experience.map((entry) => {
              const dates = dateRange(
                entry.startDate,
                entry.endDate,
                entry.current
              );
              return (
                <View key={entry.id} style={{ marginBottom: 6 }}>
                  <Text style={styles.itemTitle}>
                    {[entry.role, entry.company].filter(Boolean).join(" — ")}
                    {dates && (
                      <Text style={{ fontFamily: "Helvetica", fontSize: 7.2, color: "#4b5563" }}>
                        {" "}
                        ({dates})
                      </Text>
                    )}
                  </Text>
                  {entry.bullets
                    .filter((b) => hasText(b.text))
                    .map((b) => (
                      <View key={b.id} style={styles.mainBulletRow}>
                        <Text style={styles.mainBulletDot}>•</Text>
                        <Text style={styles.mainBulletText}>{b.text.trim()}</Text>
                      </View>
                    ))}
                </View>
              );
            })}
          </View>
        )}

        {/* REFERENCES SECTION */}
        {(references.length > 0 || certifications.length > 0) && (
          <View style={styles.mainSection}>
            <View style={styles.pillBanner}>
              <Text style={styles.pillText}>
                {references.length > 0 ? "REFERENCES" : "CERTIFICATIONS"}
              </Text>
            </View>

            {references.length > 0
              ? references.map((ref) => (
                  <View key={ref.id} style={{ marginBottom: 5 }}>
                    <Text style={styles.itemTitle}>{ref.name.trim()}</Text>
                    {hasText(ref.position) && (
                      <Text style={styles.bodyText}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>Position : </Text>
                        {ref.position.trim()}
                      </Text>
                    )}
                    {hasText(ref.workplace) && (
                      <Text style={styles.bodyText}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>Workplace : </Text>
                        {ref.workplace.trim()}
                      </Text>
                    )}
                    {hasText(ref.email) && (
                      <Text style={styles.bodyText}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>Email : </Text>
                        {ref.email.trim()}
                      </Text>
                    )}
                    {hasText(ref.phone) && (
                      <Text style={styles.bodyText}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>Phone : </Text>
                        {ref.phone.trim()}
                      </Text>
                    )}
                  </View>
                ))
              : certifications.map((cert) => (
                  <View key={cert.id} style={styles.mainBulletRow}>
                    <Text style={styles.mainBulletDot}>•</Text>
                    <Text style={styles.mainBulletText}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        {cert.name.trim()}
                      </Text>
                      {hasText(cert.issuer) && ` — ${cert.issuer.trim()}`}
                      {hasText(cert.issueDate) && ` (${cert.issueDate.trim()})`}
                    </Text>
                  </View>
                ))}
          </View>
        )}
      </View>
    </Page>
  );
}
