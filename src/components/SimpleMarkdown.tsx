/**
 * SimpleMarkdown — lightweight markdown renderer using only React Native primitives.
 * Supports the subset of markdown that Claude uses in recipe responses:
 *   **bold**, *italic*, ## headings, - bullets, 1. numbered lists, --- separators
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  children: string;
  isError?: boolean;
}

// Render inline **bold** and *italic* within a single line of text
function renderInline(text: string, baseStyle: object, key: string) {
  const parts: React.ReactNode[] = [];
  // Match **bold** or *italic*
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(
        <Text key={`${key}-t-${i++}`} style={baseStyle}>
          {text.slice(last, match.index)}
        </Text>
      );
    }
    if (match[0].startsWith('**')) {
      parts.push(
        <Text key={`${key}-b-${i++}`} style={[baseStyle, styles.bold]}>
          {match[2]}
        </Text>
      );
    } else {
      parts.push(
        <Text key={`${key}-i-${i++}`} style={[baseStyle, styles.italic]}>
          {match[3]}
        </Text>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(
      <Text key={`${key}-t-${i++}`} style={baseStyle}>
        {text.slice(last)}
      </Text>
    );
  }
  return parts.length === 1 && typeof parts[0] === 'object' ? parts[0] : (
    <Text key={key} style={baseStyle}>{parts}</Text>
  );
}

export function SimpleMarkdown({ children, isError }: Props) {
  const lines = children.split('\n');
  const nodes: React.ReactNode[] = [];
  const bodyStyle = isError ? styles.error : styles.body;

  let i = 0;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const key = `line-${i++}`;

    // Horizontal rule
    if (line === '---' || line === '***' || line === '___') {
      nodes.push(<View key={key} style={styles.hr} />);
      continue;
    }

    // ## Heading
    if (line.startsWith('## ')) {
      const text = line.slice(3);
      nodes.push(
        <Text key={key} style={styles.h2}>
          {text}
        </Text>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      const text = line.slice(2);
      nodes.push(
        <Text key={key} style={styles.h1}>
          {text}
        </Text>
      );
      continue;
    }

    // - Bullet list item
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const text = line.slice(2);
      nodes.push(
        <View key={key} style={styles.listRow}>
          <Text style={[bodyStyle, styles.bullet]}>•</Text>
          <Text style={[bodyStyle, styles.listText]}>
            {renderInline(text, bodyStyle, key)}
          </Text>
        </View>
      );
      continue;
    }

    // 1. Numbered list item
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      nodes.push(
        <View key={key} style={styles.listRow}>
          <Text style={[bodyStyle, styles.bullet]}>{numMatch[1]}.</Text>
          <Text style={[bodyStyle, styles.listText]}>
            {renderInline(numMatch[2], bodyStyle, key)}
          </Text>
        </View>
      );
      continue;
    }

    // Empty line — small spacer
    if (line === '') {
      nodes.push(<View key={key} style={styles.spacer} />);
      continue;
    }

    // Regular paragraph (may contain inline bold/italic)
    nodes.push(
      <Text key={key} style={[bodyStyle, styles.paragraph]}>
        {renderInline(line, bodyStyle, key)}
      </Text>
    );
  }

  return <View>{nodes}</View>;
}

const styles = StyleSheet.create({
  body: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    color: Colors.error,
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  h1: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  h2: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  hr: {
    height: 1,
    backgroundColor: Colors.separator,
    marginVertical: 10,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 1,
  },
  bullet: {
    marginRight: 6,
    marginTop: 1,
  },
  listText: {
    flex: 1,
  },
  paragraph: {
    marginVertical: 2,
  },
  spacer: {
    height: 4,
  },
});
