import React from "react"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { mediaQueries, space, sizes } from "../utils/presets"

import Layout from "../components/layout"
import {
  itemListDocs,
  itemListTutorial,
  itemListContributing,
} from "../utils/sidebar/item-list"
import MarkdownPageFooter from "../components/markdown-page-footer"
import DocSearchContent from "../components/docsearch-content"
import TableOfContents from "../components/docs-table-of-contents"
import FooterLinks from "../components/shared/footer-links"

import Container from "../components/container"

const containerStyles = {
  // we need to account for <Container>'s horizontal padding of
  // `space[6]` each (1.5rem), plus add a fluffy `space[9]`
  // of whitespace in between main content and TOC
  //
  // could be much cleaner/clearer, please feel free to improve 🙏
  maxWidth: `calc(${sizes.mainContentWidth.withSidebar} + ${sizes.tocWidth} + ${
    space[9]
  } + ${space[9]} + ${space[9]})`,
  paddingLeft: space[9],
  paddingRight: space[9],
}

const getDocsData = location => {
  const [urlSegment] = location.pathname.split(`/`).slice(1)
  const itemListLookup = {
    docs: itemListDocs,
    contributing: itemListContributing,
    tutorial: itemListTutorial,
  }

  return [urlSegment, itemListLookup[urlSegment]]
}

function DocsTemplate({ data, location }) {
  const page = data.mdx

  const [urlSegment, itemList] = getDocsData(location)

  return (
    <>
      <Helmet>
        <title>{page.frontmatter.title}</title>
        <meta name="description" content={page.excerpt} />
        <meta property="og:description" content={page.excerpt} />
        <meta property="og:title" content={page.frontmatter.title} />
        <meta property="og:type" content="article" />
        <meta name="twitter:description" content={page.excerpt} />
        <meta name="twitter.label1" content="Reading time" />
        <meta name="twitter:data1" content={`${page.timeToRead} min read`} />
      </Helmet>
      <Layout
        location={location}
        itemList={itemList}
        enableScrollSync={urlSegment === `docs` ? false : true}
      >
        <DocSearchContent>
          <Container
            overrideCSS={{
              paddingBottom: 0,
              [mediaQueries.lg]: {
                paddingTop: space[9],
              },
              [page.tableOfContents.items && mediaQueries.xl]: {
                ...containerStyles,
              },
            }}
          >
            <h1 id={page.fields.anchor} css={{ marginTop: 0 }}>
              {page.frontmatter.title}
            </h1>
          </Container>
          <Container
            overrideCSS={{
              paddingTop: 0,
              position: `static`,
              [mediaQueries.lg]: {
                paddingBottom: space[9],
              },
              [page.tableOfContents.items && mediaQueries.xl]: {
                ...containerStyles,
                display: `flex`,
                alignItems: `flex-start`,
              },
            }}
          >
            {console.log(page.frontmatter)}
            {!page.frontmatter.disableTableOfContents &&
              page.tableOfContents.items && (
                <div
                  css={{
                    order: 2,
                    [mediaQueries.xl]: {
                      marginLeft: space[9],
                      maxWidth: sizes.tocWidth,
                      position: `sticky`,
                      top: `calc(${sizes.headerHeight} + ${
                        sizes.bannerHeight
                      } + ${space[9]})`,
                    },
                  }}
                >
                  <TableOfContents location={location} page={page} />
                </div>
              )}
            <div
              css={{
                [page.tableOfContents.items && mediaQueries.xl]: {
                  maxWidth: sizes.mainContentWidth.withSidebar,
                  minWidth: 0,
                },
              }}
            >
              <div>
                <MDXRenderer slug={page.fields.slug}>{page.body}</MDXRenderer>
                {page.frontmatter.issue && (
                  <a
                    href={page.frontmatter.issue}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    See the issue relating to this stub on GitHub
                  </a>
                )}
                <MarkdownPageFooter page={page} />
              </div>
            </div>
          </Container>
        </DocSearchContent>
        <FooterLinks />
      </Layout>
    </>
  )
}

export default DocsTemplate

export const pageQuery = graphql`
  query($path: String!) {
    mdx(fields: { slug: { eq: $path } }) {
      body
      excerpt
      timeToRead
      tableOfContents
      fields {
        slug
        anchor
      }
      frontmatter {
        title
        overview
        issue
        disableTableOfContents
      }
      ...MarkdownPageFooterMdx
    }
  }
`
