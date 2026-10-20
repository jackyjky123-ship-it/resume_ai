import React from "react";
import { Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import {
  contactItems,
  dateRange,
  hasText,
  languageLabel,
  type TemplatePdfProps,
} from "../types";

const ACCENT_COLOR = "#0095f6";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  photoContainer: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: "hidden",
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  topAccentBar: {
    width: 32,
    height: 3,
    backgroundColor: ACCENT_COLOR,
    marginBottom: 8,
    borderRadius: 1,
  },
  fullName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 23,
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  roleApplied: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: ACCENT_COLOR,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 3,
  },
  contactItem: {
    fontSize: 8.5,
    color: "#64748b",
    textDecoration: "none",
  },
  contactDot: {
    fontSize: 8.5,
    color: "#cbd5e1",
    marginHorizontal: 5,
  },
  section: {
    marginTop: 11,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  sectionAccentBar: {
    width: 3,
    height: 11,
    backgroundColor: ACCENT_COLOR,
    marginRight: 6,
    borderRadius: 1,
  },
  sectionHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  entry: {
    marginBottom: 7.5,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryRole: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#0f172a",
  },
  entryCompany: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#475569",
  },
  entryDate: {
    fontSize: 8.5,
    color: "#64748b",
  },
  entryLocation: {
    fontSize: 8.5,
    color: "#94a3b8",
    marginBottom: 2,
  },
  bulletList: {
    marginTop: 2,
    paddingLeft: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletPoint: {
    width: 10,
    fontSize: 8.5,
    color: ACCENT_COLOR,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.4,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.45,
    color: "#334155",
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  skillBadge: {
    backgroundColor: "#f8fafc",
    borderWidth: 0.75,
    borderColor: "#e2e8f0",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 8.5,
    color: "#334155",
  },
  languageRow: {
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.4,
  },
});

export function ModernPdf({ document }: TemplatePdfProps) {
  const contacts = contactItems(document);
  const experience = document.experience.filter(
    (e) => hasText(e.company) || hasText(e.role) || e.bullets.some((b) => hasText(b.text))
  );
  const education = document.education.filter(
    (e) => hasText(e.school) || hasText(e.degree) || hasText(e.field)
  );
  const skills = document.skills.filter((s) => hasText(s.name));
  const projects = document.projects.filter(
    (p) => hasText(p.name) || hasText(p.description) || p.bullets.some((b) => hasText(b.text))
  );
  const certifications = document.certifications.filter(
    (c) => hasText(c.name) || hasText(c.issuer)
  );
  const languages = document.languages.filter((l) => hasText(l.name));

  return (
    <Page size="A4" style={styles.page}>
      {/* Header with Brand Blue Accent */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.topAccentBar} />
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
        {hasText(document.personal.photoUrl) && (
          <View style={styles.photoContainer}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={document.personal.photoUrl} style={styles.photo} />
          </View>
        )}
      </View>

      {/* Summary */}
      {hasText(document.summary) && (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionHeading}>Summary</Text>
          </View>
          <Text style={styles.paragraph}>{document.summary.trim()}</Text>
        </View>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionHeading}>Experience</Text>
          </View>
          {experience.map((entry) => {
            const bullets = entry.bullets.filter((b) => hasText(b.text));
            return (
              <View key={entry.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryRole}>
                    {entry.role.trim() || "Role"}
                    {hasText(entry.company) && (
                      <Text style={styles.entryCompany}> · {entry.company.trim()}</Text>
                    )}
                  </Text>
                  <Text style={styles.entryDate}>
                    {dateRange(entry.startDate, entry.endDate, entry.current)}
                  </Text>
                </View>
                {hasText(entry.location) && (
                  <Text style={styles.entryLocation}>{entry.location.trim()}</Text>
                )}
                {bullets.length > 0 && (
                  <View style={styles.bulletList}>
                    {bullets.map((b) => (
                      <View key={b.id} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>›</Text>
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

      {/* Education */}
      {education.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionHeading}>Education</Text>
          </View>
          {education.map((entry) => (
            <View key={entry.id} style={styles.entry} wrap={false}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryRole}>
                  {[entry.degree.trim(), entry.field.trim()].filter(Boolean).join(", ") ||
                    "Degree"}
                  {hasText(entry.school) && (
                    <Text style={styles.entryCompany}> · {entry.school.trim()}</Text>
                  )}
                </Text>
                <Text style={styles.entryDate}>
                  {dateRange(entry.startDate, entry.endDate)}
                </Text>
              </View>
              {hasText(entry.details) && (
                <Text style={styles.entryLocation}>{entry.details.trim()}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Skills as Modern Badges */}
      {skills.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionHeading}>Skills</Text>
          </View>
          <View style={styles.skillsWrap}>
            {skills.map((s) => (
              <Text key={s.id} style={styles.skillBadge}>
                {s.name.trim()}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionHeading}>Projects</Text>
          </View>
          {projects.map((entry) => {
            const bullets = entry.bullets.filter((b) => hasText(b.text));
            return (
              <View key={entry.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryRole}>
                    {entry.name.trim() || "Project"}
                    {hasText(entry.url) && (
                      <Text style={styles.entryCompany}> — {entry.url.trim()}</Text>
                    )}
                  </Text>
                </View>
                {hasText(entry.description) && (
                  <Text style={styles.paragraph}>{entry.description.trim()}</Text>
                )}
                {bullets.length > 0 && (
                  <View style={styles.bulletList}>
                    {bullets.map((b) => (
                      <View key={b.id} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>›</Text>
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

      {/* Certifications */}
      {certifications.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionHeading}>Certifications</Text>
          </View>
          {certifications.map((entry) => (
            <View key={entry.id} style={styles.entryHeader} wrap={false}>
              <Text style={styles.entryRole}>
                {entry.name.trim() || "Certification"}
                {hasText(entry.issuer) && (
                  <Text style={styles.entryCompany}> · {entry.issuer.trim()}</Text>
                )}
              </Text>
              <Text style={styles.entryDate}>{entry.issueDate.trim()}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionHeading}>Languages</Text>
          </View>
          <Text style={styles.languageRow}>
            {languages
              .map((l) => languageLabel(l.name, l.proficiency))
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
        </View>
      )}
    </Page>
  );
}

