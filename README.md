# Using this template

## Creating your own repository

This is a template repository to help you get started on your own portfolio. To use it:

1. Click **Use this template > Create a new repository**.
2. Name the repository `<your github username>.github.io`. For example, mine would be named [ngjunsiang.github.io](https://github.com/ngjunsiang/ngjunsiang.github.io).
3. Click **Create repository**.

## Publishing your Github Page

To view your page at `<your github username>.github.io`, you need to enable Github Pages. Do the following:

1. Go to **Settings > Pages**.
2. Under **Build and deployment > Branch**, select `main` branch.
3. Click **Save**.
4. It may take 10-15 seconds for your Github Page to be deployed. When it is successful, you should be able to view it at `<your github username>.github.io`.

# Getting started

## Make some content

Before you start on writing the HTML and CSS:

1. Decide the headings your portfolio is going to have. See `ABOUT.md` if you need help with getting started.
2. Write your content first. What do you want to display?
   - Less is more: don't list things you are no longer doing or following.
3. Organise the content under the appropriate headings.

## Write the content

When you have your content, start by converting the content into HTML. Don't worry about styling yet; you need content on the page before you can style it.

1. Edit `index.html`, inserting content into appopriate HTML elements to give your page some structure.
2. Use Google / ChatGPT to discover what are the appropriate elements to use.
3. You can remove the comments if you wish.

Note: The default styling applied by your browser to each element is **not going to be what you actually want**. Ignore this for now; we will work on styling separately.

## Style your content

When you have some content to style, you can edit `styles.css`, which is linked in `index.html` to apply its styles.

1. Use CSS selectors to style the elements of the page.
   You can ask ChatGPT to help you with this, but be sure to ask it to explain if you don't understand what the selector does.
2. If you want, you can apply a baseline CSS stylesheet by linking it before `styles.css` in `index.html`.
   A baseline stylesheet defines a nicer set of styles that you can then build on top of.
3. Commit and push your changes, wait a few seconds, then preview the changes in your browser.
   - You should use DevTools in your browser to preview the effects of CSS changes, then make the changes in your stylesheet when you are happy with them.
