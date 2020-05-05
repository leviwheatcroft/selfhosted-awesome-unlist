## Why

The [Selfhosted Awesome List](https://github.com/awesome-selfhosted/awesome-selfhosted) is indeed awesome, but like all lists becomes less and less useful as it's size increases. [Un]list solves some of these problems:

 - **awesome or not?** when looking at entries you need an indication of whether a project is still active, well supported, and beloved by it's community. [Un]list shows you stars, issues, and last updated information.
 - **spoon or fork?** many entries on the list defy categorisation. One project might belong in multiple categories, or maybe requires a category of it's own. [Un]list uses tags which solve this problem. Presently it just auto generates a few simple tags.
 - **all the sauce!** readme's / overviews all in one place in a neat, tidy, concise format
 - **searchable!** ok, I'm still working on this, but it's gonna be great!

## Help Wanted

### Tags

One of the main objectives I had in creating this repo was to organise projects with tags. When the projects are scraped, some simple tags are included like the category from the Selfhosted Awesome List, and whatever language github thinks the project is built with. Of course, there's a long way to go with this. If you have some ideas about how to autogenerate some useful tags I'd love to hear from you. However, user contributed tags will always be the most useful.

### UI

Clearly, beautiful UI's aren't my thing. If you have the magical ability to make things look great, then it would be great to have your help.

### Overviews & Readmes

In an effort to keep things simple, readmes are only scraped from projects with github urls, so we're not scraping text from project websites. This can be solved by either adding a github url to a project, or by creating an overview (by copying & pasting some relevant info?). The [No Repo](/tags/no-repo.html) tag provides a list of projects with no specified repository.

The overview is the brief content shown on the tag pages, it's calculated programatically like this:

  1. if `projects/contributed/projectName.md` exists, then the content between the first and second heading is used, or else
  2. if `projects/scraped/projectName.md` contains markdown content, then the content between the first and second heading is used, or else
  3. the `description` meta field from `projects/scraped/projectName.md` is used.

The strategy of scraping out the content between the first and second headings in readme content is somewhat effective, but of course there's cases in which it doesn't work.

## Contributing

The basic idea is that data pulled in from elsewhere should not be committed to this repo. When you scrape data it's all stored in `projects/scraped` which will not be committed. Any files stored in `projects/contributed` will be overlaid onto the scraped data.

For example, if you'd like to provide a better overview for a project, create the file `projects/contributed/projectName.md` if it doesn't exist, and include something like the following:

```
---
name: projectname
---
this text will be discarded

## some heading (discarded)

this will be the new overview

## some other heading (discarded)

this will be discarded
```

Note that while some elements of the content will be discarded when rendering the overview, everything will be included at the front of the project's readme when viewing that project's detail page.

## Building Locally

 - clone repo
 - `cp config/local.template.js config/local.js`
  - set github api key in `config/local.js`
 - `yarn`
 - `yarn run scrape:awesome` - scrape projects from awesome lists
 - `yarn run scrape:github` - populate projects with github info
 - `yarn run dev` - build & start dev server

_production build_

`yarn run buildContent && NODE_ENV=production yarn run buildAssets`
