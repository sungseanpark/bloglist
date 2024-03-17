describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    // create here a user to backend
    const user = {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.visit('http://localhost:5173')
  })

  it('Login form is shown', function() {
    cy.contains('Log in to application')
  })

  describe('Login',function() {
    it('succeeds with correct credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()

      cy.contains('Matti Luukkainen logged in')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.get('.error').contains('Wrong username or password')
      cy.get('.error').should('have.css', 'color', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()
    })

    it('A blog can be created', function() {
      cy.contains('new blog').click()
      cy.get('#title').type('Ab Hypertrophy Training Tips')
      cy.get('#author').type('Mike Israetel')
      cy.get('#url').type('https://rpstrength.com/blogs/articles/ab-hypertrophy-training-tips')
      cy.get('#create-button').click()

      cy.contains('Ab Hypertrophy Training Tips Mike Israetel')
    })

    describe('After a blog has been created', function() {
      beforeEach(function() {
        cy.contains('new blog').click()
        cy.get('#title').type('Ab Hypertrophy Training Tips')
        cy.get('#author').type('Mike Israetel')
        cy.get('#url').type('https://rpstrength.com/blogs/articles/ab-hypertrophy-training-tips')
        cy.get('#create-button').click()
      })

      it('A blog can be liked', function() {
        cy.contains('view').click()
        cy.contains('like').click()
        cy.contains('likes 1')
      })

      it('A blog can be deleted by the user who created it', function() {
        cy.contains('view').click()
        cy.get('#remove-button').click()
      })

      it('A blog can only be deleted by the user who created it, not anyone else', function() {
        const user2 = {
          name: 'Sean Park',
          username: 'seanpark',
          password: 'sp123'
        }
        cy.request('POST', 'http://localhost:3003/api/users/', user2)

        cy.get('#logout-button').click()
        cy.get('#username').type('seanpark')
        cy.get('#password').type('sp123')
        cy.get('#login-button').click()

        cy.contains('view').click()
        cy.get('#remove-button')
          .should('have.css', 'display', 'none')
      })
    })

    describe('After 3 blogs are created and each liked different number of times', function() {
      it.only('blogs are ordered by likes', function() {
        cy.get('#newblog-button').click()
        cy.get('#title').type('Blog with 0 likes')
        cy.get('#author').type('0liker')
        cy.get('#url').type('https://blog.com/nolikes')
        cy.get('#create-button').click()

        cy.get('#newblog-button').click()
        cy.get('#title').type('Blog with 5 likes')
        cy.get('#author').type('5liker')
        cy.get('#url').type('https://blog.com/5likes')
        cy.get('#create-button').click()

        cy.get('#newblog-button').click()
        cy.get('#title').type('Blog with 10 likes')
        cy.get('#author').type('10liker')
        cy.get('#url').type('https://blog.com/10likes')
        cy.get('#create-button').click()

        cy.contains('Blog with 5 likes')
          .contains('view')
          .click()

        cy.contains('Blog with 5 likes 5liker')
          .parent()
          .find('#like-button')
          .as('the5Button')

        cy.get('@the5Button').click()
        cy.wait(1000)
        cy.get('@the5Button').click()
        cy.wait(1000)
        cy.get('@the5Button').click()
        cy.wait(1000)
        cy.get('@the5Button').click()
        cy.wait(1000)
        cy.get('@the5Button').click()
        cy.wait(1000)

        cy.contains('Blog with 10 likes')
          .contains('view')
          .click()

        cy.contains('Blog with 10 likes 10liker')
          .parent()
          .find('#like-button')
          .as('the10Button')

        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)
        cy.get('@the10Button').click()
        cy.wait(1000)

        cy.get('.blog').eq(0).should('contain', 'Blog with 10 likes')
        cy.get('.blog').eq(1).should('contain', 'Blog with 5 likes')
        cy.get('.blog').eq(2).should('contain', 'Blog with 0 likes')
      })
    })
  })
})