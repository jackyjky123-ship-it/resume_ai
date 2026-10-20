import React from "react";
import { Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import {
  contactItems,
  dateRange,
  hasText,
  languageLabel,
  type TemplatePdfProps,
} from "../types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.38,
    color: "#262626",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#171717",
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  fullName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 21,
    color: "#171717",
    letterSpacing: -0.2,
  },
  roleApplied: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#525252",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  body: {
    flexDirection: "row",
    gap: 16,
  },
  sidebar: {
    width: "32%",
    paddingRight: 8,
    borderRightWidth: 0.75,
    borderRightColor: "#e5e5e5",
  },
  photoContainer: {
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  main: {
    width: "68%",
  },
  sideSection: {
    marginBottom: 9,
  },
  sideHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#171717",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 2,
    marginBottom: 4,
  },
  mainSection: {
    marginBottom: 9,
  },
  mainHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#171717",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 2,
    marginBottom: 5,
  },
  contactItem: {
    fontSize: 8,
    color: "#404040",
    marginBottom: 3,
    textDecoration: "none",
  },
  sideItem: {
    marginBottom: 4,
  },
  sideItemTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#171717",
  },
  sideItemSubtitle: {
    fontSize: 8,
    color: "#525252",
  },
  sideItemDate: {
    fontSize: 7.5,
    color: "#737373",
  },
  skillText: {
    fontSize: 8,
    color: "#262626",
    marginBottom: 2.5,
  },
  entry: {
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#171717",
  },
  entrySubtitle: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#525252",
  },
  entryDate: {
    fontSize: 8,
    color: "#525252",
  },
  entryLocation: {
    fontSize: 8,
    color: "#737373",
    marginBottom: 1.5,
  },
  bulletList: {
    marginTop: 1.5,
    paddingLeft: 3,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1,
  },
  bulletPoint: {
    width: 8,
    fontSize: 8,
    color: "#525252",
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: "#262626",
    lineHeight: 1.35,
  },
  paragraph: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: "#262626",
  },
});

export function CompactPdf({ document }: TemplatePdfProps) {
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
      {/* Compact Header */}
      <View style={styles.header}>
        <Text style={styles.fullName}>
          {document.personal.fullName.trim() || "Your Name"}
        </Text>
        {hasText(document.personal.roleApplied) && (
          <Text style={styles.roleApplied}>
            {document.personal.roleApplied.trim()}
          </Text>
        )}
      </View>

      <View style={styles.body}>
        {/* Left Sidebar (32%) */}
        <View style={styles.sidebar}>
          {hasText(document.personal.photoUrl) && (
            <View style={styles.photoContainer}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={document.personal.photoUrl} style={styles.photo} />
            </View>
          )}
          {/* Contact */}
          {contacts.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Contact</Text>
              {contacts.map((c, idx) =>
                c.url ? (
                  <Link key={idx} src={c.url} style={styles.contactItem}>
                    {c.label}
                  </Link>
                ) : (
                  <Text key={idx} style={styles.contactItem}>
                    {c.label}
                  </Text>
                )
              )}
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Skills</Text>
              {skills.map((s) => (
                <Text key={s.id} style={styles.skillText}>
                  • {s.name.trim()}
                </Text>
              ))}
            </View>
          )}

          {/* Education in sidebar */}
          {education.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Education</Text>
              {education.map((entry) => (
                <View key={entry.id} style={styles.sideItem} wrap={false}>
                  <Text style={styles.sideItemTitle}>
                    {[entry.degree.trim(), entry.field.trim()].filter(Boolean).join(", ") ||
                      "Degree"}
                  </Text>
                  {hasText(entry.school) && (
                    <Text style={styles.sideItemSubtitle}>{entry.school.trim()}</Text>
                  )}
                  <Text style={styles.sideItemDate}>
                    {dateRange(entry.startDate, entry.endDate)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Certifications in sidebar */}
          {certifications.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Certifications</Text>
              {certifications.map((entry) => (
                <View key={entry.id} style={styles.sideItem} wrap={false}>
                  <Text style={styles.sideItemTitle}>
                    {entry.name.trim() || "Certification"}
                  </Text>
                  {hasText(entry.issuer) && (
                    <Text style={styles.sideItemSubtitle}>{entry.issuer.trim()}</Text>
                  )}
                  <Text style={styles.sideItemDate}>{entry.issueDate.trim()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Languages in sidebar */}
          {languages.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Languages</Text>
              {languages.map((l) => (
                <Text key={l.id} style={styles.skillText}>
                  • {languageLabel(l.name, l.proficiency)}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Right Main Column (68%) */}
        <View style={styles.main}>
          {/* Summary */}
          {hasText(document.summary) && (
            <View style={styles.mainSection}>
              <Text style={styles.mainHeading}>Summary</Text>
              <Text style={styles.paragraph}>{document.summary.trim()}</Text>
            </View>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainHeading}>Experience</Text>
              {experience.map((entry) => {
                const bullets = entry.bullets.filter((b) => hasText(b.text));
                return (
                  <View key={entry.id} style={styles.entry} wrap={false}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>
                        {entry.role.trim() || "Role"}
                        {hasText(entry.company) && (
                          <Text style={styles.entrySubtitle}> · {entry.company.trim()}</Text>
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

          {/* Projects */}
          {projects.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainHeading}>Projects</Text>
              {projects.map((entry) => {
                const bullets = entry.bullets.filter((b) => hasText(b.text));
                return (
                  <View key={entry.id} style={styles.entry} wrap={false}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>
                        {entry.name.trim() || "Project"}
                        {hasText(entry.url) && (
                          <Text style={styles.entrySubtitle}> — {entry.url.trim()}</Text>
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
        </View>
      </View>
    </Page>
  );
}

