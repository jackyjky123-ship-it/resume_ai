import React from "react";
import { Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import {
  contactItems,
  dateRange,
  hasText,
  languageLabel,
  type TemplatePdfProps,
} from "../types";

const ACCENT_COLOR = "#1d4ed8"; // Executive blue accent

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: 10,
    marginBottom: 10,
  },
  photoContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
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
    backgroundColor: "#f1f5f9",
  },
  initialsText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: "#64748b",
  },
  headerInfo: {
    flex: 1,
  },
  fullName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 21,
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  roleApplied: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: ACCENT_COLOR,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 2,
  },
  contactItem: {
    fontSize: 8,
    color: "#64748b",
    textDecoration: "none",
  },
  contactDot: {
    fontSize: 8,
    color: "#cbd5e1",
    marginHorizontal: 4,
  },
  section: {
    marginTop: 8,
  },
  sectionHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    borderBottomWidth: 0.75,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 2,
    marginBottom: 5,
  },
  summaryBox: {
    backgroundColor: "#f8fafc",
    borderLeftWidth: 2.5,
    borderLeftColor: ACCENT_COLOR,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  summaryText: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: "#334155",
  },
  entryBlock: {
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  roleText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#0f172a",
  },
  companyText: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#334155",
  },
  dateLocationText: {
    fontSize: 8,
    color: "#64748b",
  },
  bulletList: {
    marginTop: 2,
    paddingLeft: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletPoint: {
    width: 8,
    fontSize: 8,
    color: "#64748b",
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.35,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillBadge: {
    backgroundColor: "#f1f5f9",
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    borderRadius: 3,
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    fontSize: 8,
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
    marginRight: 4,
  },
  paragraph: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: "#334155",
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

export function ProfessionalPdf({ document }: TemplatePdfProps) {
  const contacts = contactItems(document);
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

  const hasPhoto = hasText(document.personal.photoUrl);
  const initials = getInitials(document.personal.fullName);

  return (
    <Page size="A4" style={styles.page}>
      {/* Executive Header */}
      <View style={styles.header}>
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

        <View style={styles.headerInfo}>
          <Text style={styles.fullName}>
            {document.personal.fullName.trim() || "Your Name"}
          </Text>

          {hasText(document.personal.roleApplied) && (
            <Text style={styles.roleApplied}>
              {document.personal.roleApplied.trim()}
            </Text>
          )}

          {contacts.length > 0 && (
            <View style={styles.contactRow}>
              {contacts.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Text style={styles.contactDot}>·</Text>}
                  {item.url ? (
                    <Link src={item.url} style={styles.contactItem}>
                      {item.label}
                    </Link>
                  ) : (
                    <Text style={styles.contactItem}>{item.label}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Summary */}
      {hasText(document.summary) && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Executive Summary</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{document.summary.trim()}</Text>
          </View>
        </View>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Work Experience</Text>
          {experience.map((entry) => (
            <View key={entry.id} style={styles.entryBlock}>
              <View style={styles.entryHeader}>
                <View style={{ flexDirection: "row", alignItems: "baseline", flex: 1 }}>
                  <Text style={styles.roleText}>{entry.role.trim() || "Role"}</Text>
                  {hasText(entry.company) && (
                    <Text style={styles.companyText}> at {entry.company.trim()}</Text>
                  )}
                </View>
                <Text style={styles.dateLocationText}>
                  {dateRange(entry.startDate, entry.endDate, entry.current)}
                  {hasText(entry.location) ? ` · ${entry.location.trim()}` : ""}
                </Text>
              </View>

              {entry.bullets.filter((b) => hasText(b.text)).length > 0 && (
                <View style={styles.bulletList}>
                  {entry.bullets
                    .filter((b) => hasText(b.text))
                    .map((bullet) => (
                      <View key={bullet.id} style={styles.bulletRow}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{bullet.text.trim()}</Text>
                      </View>
                    ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Education</Text>
          {education.map((entry) => (
            <View key={entry.id} style={styles.entryBlock}>
              <View style={styles.entryHeader}>
                <View style={{ flexDirection: "row", alignItems: "baseline", flex: 1 }}>
                  <Text style={styles.roleText}>
                    {[entry.degree, entry.field].filter(hasText).join(" in ") ||
                      "Degree"}
                  </Text>
                  {hasText(entry.school) && (
                    <Text style={styles.companyText}> — {entry.school.trim()}</Text>
                  )}
                </View>
                <Text style={styles.dateLocationText}>
                  {dateRange(entry.startDate, entry.endDate)}
                  {hasText(entry.location) ? ` · ${entry.location.trim()}` : ""}
                </Text>
              </View>
              {hasText(entry.details) && (
                <Text style={styles.paragraph}>{entry.details.trim()}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Skills & Core Competencies</Text>
          <View style={styles.skillsWrap}>
            {skills.map((skill) => (
              <Text key={skill.id} style={styles.skillBadge}>
                {skill.name.trim()}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Key Projects</Text>
          {projects.map((proj) => (
            <View key={proj.id} style={styles.entryBlock}>
              <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 1 }}>
                <Text style={styles.roleText}>{proj.name.trim() || "Project"}</Text>
                {hasText(proj.url) && (
                  <Link
                    src={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`}
                    style={{ fontSize: 8, color: ACCENT_COLOR, marginLeft: 6 }}
                  >
                    {proj.url.replace(/^https?:\/\//i, "")}
                  </Link>
                )}
              </View>
              {hasText(proj.description) && (
                <Text style={styles.paragraph}>{proj.description.trim()}</Text>
              )}
              {proj.bullets.filter((b) => hasText(b.text)).length > 0 && (
                <View style={styles.bulletList}>
                  {proj.bullets
                    .filter((b) => hasText(b.text))
                    .map((bullet) => (
                      <View key={bullet.id} style={styles.bulletRow}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{bullet.text.trim()}</Text>
                      </View>
                    ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Certifications</Text>
          {certifications.map((cert) => (
            <View
              key={cert.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 2,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "baseline", flex: 1 }}>
                <Text style={styles.roleText}>{cert.name.trim()}</Text>
                {hasText(cert.issuer) && (
                  <Text style={styles.companyText}> · {cert.issuer.trim()}</Text>
                )}
              </View>
              {hasText(cert.issueDate) && (
                <Text style={styles.dateLocationText}>{cert.issueDate.trim()}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Languages</Text>
          <Text style={styles.paragraph}>
            {languages
              .map((l) => languageLabel(l.name, l.proficiency))
              .join("   ·   ")}
          </Text>
        </View>
      )}
    </Page>
  );
}
