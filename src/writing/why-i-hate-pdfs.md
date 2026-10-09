---
id: "2"
title: "Why I hate PDFs"
slug: "why-i-hate-pdfs"
author: "Mason Lavinder"
publishDate: "2025-12-15"
tags: ["development"]
featured: true
excerpt: "A developer's perspective on why PDFs remain a problematic file format despite their ubiquity"
---
## The Obvious (and Inconvenient) Truth

Let me address the obvious: PDFs are ubiquitously used across industries. They're the standard for contracts, legal documents, forms, and digital signing workflows. DocuSign built a multi-billion dollar company around them. They can be viewed in browsers, Adobe products, and countless other applications.

But despite their popularity, PDFs have significant drawbacks that make them a nightmare to work with as a developer.

## The Image-Based PDF Problem

The biggest issue? **Many PDFs aren't actually text-readable.** They're literally a bunch of images slapped together, requiring OCR (Optical Character Recognition) to extract any meaningful text. While text-based PDFs exist and work okay, image-based PDFs are the bane of my existence.

I've worked on countless projects where half the complexity stemmed from managing PDFs. Users would upload image-based PDFs, forcing us to build entire microservices to handle OCR processing. The accuracy of OCR can range from 50% to 98% depending on document quality—meaning even good OCR software creates roughly 200 errors on a standard page with 2,000 characters. On top of that, OCR can be computationally expensive (thus monetarily expensive). Tons of legacy and enterprise companies deal with PDFs from old scans of physical paper or handwritten text. 

## The Templating Nightmare

Then there's PDF generation. I once had to create a microservice just to generate PDF cover pages based on metadata. The solution? Puppeteer running on AWS Lambda, converting an HTML template to PDF. An entire microservice. Literally just to make a cover page. Don't even get me started on trying to maintain consistent PDF templating that matches Word documents.

## Adobe's De Facto Monopoly

While PDF became an ISO open standard in 2008, Adobe maintains significant control over the format's development and dominates the PDF editing market. Here's the frustrating reality: **Why do I need a subscription to effectively use a file format?**

Advanced features like interactive forms and multimedia remain locked in Adobe's proprietary software. Even though the PDF standard is technically open, Adobe's tools are still considered the best—and they're definitely not free.

The whole concept of "editing" PDFs feels backwards. We're trying to modify a format designed to be a final, unchangeable document. It's like trying to edit a printed page.

## Better Alternatives Exist

Now, you might be thinking: "Mason, why so much hate? It's just a PDF." I know this is a subjective opinion. But there are genuinely better options for styled, secure document formats.

I love Markdown for many use cases, though I know it's not practical for everything. But **DOCX is actually a good document format.** It's built on structured XML that follows clear standards. The entire file is essentially a ZIP file of XML files.

While there's a gap in programmatic control of the underlying XML, there's decent package support, especially in the Python ecosystem. Plus, DOCX is natively compatible with Microsoft and Google products, making collaboration straightforward.

## The Bottom Line

I understand PDFs serve a purpose for final, print-ready documents. But for workflows involving document processing, generation, or modification, they create unnecessary complexity and pain.

PDF might be the industry standard, but that doesn't make it the best choice for modern document workflows. I still don't like it.

### Opportunity

We need a way to get legacy documentation and handwritten notes into another file format that is not PDF. I think a service to go from old PDFs, JPEGs, handwritten stuff directly into Word documents would be valuable. I think you could make significant amounts of money just doing this in bulk for enterprises. 

---

## Sources & References

- [Adobe's Monopoly on PDFs: The Innovation Bottleneck](https://medium.com/@abijithbalaji/adobes-monopoly-on-pdfs-the-innovation-bottleneck-and-the-need-for-open-source-alternatives-f09aeda99de0)
- [Three Types of PDFs](https://nlsblog.org/2020/06/12/three-types-of-pdfs/)
- [OCR Best Practices - University of Illinois](https://guides.library.illinois.edu/OCR/bestpractices)
- [Structure of DOCX Files: XML Schema](https://medium.com/@stefan.sommarsjo/structure-of-docx-files-xml-schema-file-organization-and-common-errors-c74d841a65e7)
- [DOCX: A Series of XML Files - Toptal](https://www.toptal.com/xml/an-informal-introduction-to-docx)
- [Microsoft DOCX Documentation](https://learn.microsoft.com/en-us/openspecs/office_standards/ms-docx/728a7abc-7f55-40dc-90a7-1276ff53c8b2) 
