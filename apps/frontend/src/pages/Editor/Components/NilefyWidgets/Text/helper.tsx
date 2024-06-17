import rehypeParse from 'rehype-parse';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { useState, useEffect } from 'react';
export const useParseText = (text: string) => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const parseText = async () => {
      try {
        const processedFile = await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeSanitize, {
            ...defaultSchema,
            attributes: {
              ...defaultSchema.attributes,
              h1: ['style'],
              h2: ['style'],
              h3: ['style'],
              h4: ['style'],
              h5: ['style'],
              h6: ['style'],
              p: ['style'],
              span: ['style'],
              div: ['style'],
            },
          })
          .use(rehypeStringify)
          .process(text);

        setContent(String(processedFile));
      } catch (error) {
        setContent('');
      }
    };

    parseText();
  }, [text]);

  return content;
};
