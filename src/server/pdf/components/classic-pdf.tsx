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
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
    color: "#262626",
    backgroundColor: "#ffffff",
  },
  header: {
    textAlign: "center",
    marginBottom: 12,
  },
  photoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fullName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    lineHeight: 1.15,
    color: "#171717",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  roleApplied: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    lineHeight: 1.3,
    color: "#525252",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  contactItem: {
    fontSize: 8.5,
    color: "#525252",
    textDecoration: "none",
  },
  contactDot: {
    fontSize: 8.5,
    color: "#a3a3a3",
    marginHorizontal: 4,
  },
  section: {
    marginTop: 10,
  },
  sectionHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#262626",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 2,
    marginBottom: 6,
  },
  entry: {
    marginBottom: 7,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#171717",
  },
  entrySubtitle: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#525252",
  },
  entryDate: {
    fontSize: 8.5,
    color: "#525252",
  },
  entryLocation: {
    fontSize: 8.5,
    color: "#737373",
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
    fontSize: 9,
    color: "#525252",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#262626",
    lineHeight: 1.4,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.45,
    color: "#262626",
  },
  inlineRow: {
    fontSize: 9,
    color: "#262626",
    lineHeight: 1.4,
  },
});

export function ClassicPdf({ document }: TemplatePdfProps) {
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
  const references = (document.references ?? []).filter(
    (r) =>
      hasText(r.name) ||
      hasText(r.position) ||
      hasText(r.workplace) ||
      hasText(r.email) ||
      hasText(r.phone)
  );

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {hasText(document.personal.photoUrl) && (
          <View style={styles.photoContainer}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={document.personal.photoUrl} style={styles.photo} />
          </View>
        )}
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

      {/* Summary */}
      {hasText(document.summary) && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Summary</Text>
          <Text style={styles.paragraph}>{document.summary.trim()}</Text>
        </View>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Experience</Text>
          {experience.map((entry) => {
            const bullets = entry.bullets.filter((b) => hasText(b.text));
            return (
              <View key={entry.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {entry.role.trim() || "Role"}
                    {hasText(entry.company) && (
                      <Text style={styles.entrySubtitle}>
                        {"\u00A0· "}
                        {entry.company.trim()}
                      </Text>
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

      {/* Education */}
      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Education</Text>
          {education.map((entry) => (
            <View key={entry.id} style={styles.entry} wrap={false}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>
                  {[entry.degree.trim(), entry.field.trim()].filter(Boolean).join(", ") ||
                    "Degree"}
                  {hasText(entry.school) && (
                    <Text style={styles.entrySubtitle}>
                      {"\u00A0· "}
                      {entry.school.trim()}
                    </Text>
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

      {/* Skills */}
      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Skills</Text>
          <Text style={styles.inlineRow}>
            {skills.map((s) => s.name.trim()).join("  ·  ")}
          </Text>
        </View>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Projects</Text>
          {projects.map((entry) => {
            const bullets = entry.bullets.filter((b) => hasText(b.text));
            return (
              <View key={entry.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {entry.name.trim() || "Project"}
                    {hasText(entry.url) && (
                      <Text style={styles.entrySubtitle}>
                        {"\u00A0— "}
                        {entry.url.trim()}
                      </Text>
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

      {/* Certifications */}
      {certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Certifications</Text>
          {certifications.map((entry) => (
            <View key={entry.id} style={styles.entryHeader} wrap={false}>
              <Text style={styles.entryTitle}>
                {entry.name.trim() || "Certification"}
                {hasText(entry.issuer) && (
                  <Text style={styles.entrySubtitle}>
                    {"\u00A0· "}
                    {entry.issuer.trim()}
                  </Text>
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
          <Text style={styles.sectionHeading}>Languages</Text>
          <Text style={styles.inlineRow}>
            {languages
              .map((l) => languageLabel(l.name, l.proficiency))
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
        </View>
      )}
      {/* References */}
      {references.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>References</Text>
          {references.map((entry) => (
            <View key={entry.id} style={styles.entry} wrap={false}>
              <Text style={styles.entryTitle}>
                {[entry.name.trim(), entry.position.trim()]
                  .filter(Boolean)
                  .join(" — ")}
              </Text>
              {[entry.workplace, entry.email, entry.phone]
                .filter(hasText)
                .length > 0 && (
                <Text style={styles.entrySubtitle}>
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
    </Page>
  );
}

