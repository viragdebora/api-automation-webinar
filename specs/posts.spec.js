'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const input = require('../specs/input-datas.json');
const postLength = 100;

describe('Posts', () => {
    let addedPostId;
    const createdPost = input[0];
    const givenIdPost = input[1];
    describe('Created', () => {
        it('should add a new post', () => {
            return chakram.post(api.url('posts'), {
                title: createdPost.title,
                body: createdPost.body,
                userId: createdPost.userId
            }).then(response => {
                expect(response).to.have.status(201);
                addedPostId = response.body.data.id;
                expect(response).to.have.json('data', newPost => {
                    expect(newPost.title).to.eql(createdPost.title);
                    expect(newPost.body).to.eql(createdPost.body);
                    expect(newPost.userId).to.eql(createdPost.userId);
                });
                return chakram.wait();
            });
        });
        it('should not add a new post with existing ID', () => {
            const response = chakram.post(api.url('posts'), {
                title: 'already existing',
                body: 'already existing',
                userId: 1,
                id: 1
            });
            expect(response).to.have.status(500);
            return chakram.wait();
        });
        it('should add a post with given non-existing ID', () => {
            const response = chakram.post(api.url('posts'), {
                title: givenIdPost.title,
                body: givenIdPost.body,
                userId: givenIdPost.userId,
                id: givenIdPost.id
            });
            expect(response).to.have.status(201);
            expect(response).to.have.json('data', newPost => {
                expect(newPost.title).to.eql(givenIdPost.title);
                expect(newPost.body).to.eql(givenIdPost.body);
                expect(newPost.userId).to.eql(givenIdPost.userId);
                expect(newPost.id).to.eql(givenIdPost.id);
            });
            return chakram.wait();
        });
        after(() => {
            chakram.delete(api.url('posts/' + givenIdPost.id));
            if (addedPostId) {
                chakram.delete(api.url('posts/' + addedPostId));
            }
        });
    });

    describe('Read', () => {
        it('should return all the posts', () => {
            const response = chakram.get(api.url('posts'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', posts => {
                expect(posts).to.be.instanceof(Array);
                expect(posts).to.have.lengthOf(postLength);
            });
            return chakram.wait();
        });
        it('should return a given a post', () => {
            const expectedPost = data.posts[0];
            const response = chakram.get(api.url(`posts/${expectedPost.id}`));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', post => {
                expect(post).to.deep.equal(expectedPost);
            });
            return chakram.wait();
        });
        it('should not return a post with non-existing id', () => {
            const response = chakram.get(api.url('posts/203'));
            expect(response).to.have.status(404);
            return chakram.wait();
        });
        it('should return a post by title', () => {
            const expectedPost = data.posts[1];
            const response = chakram.get(api.url(`posts?title=${expectedPost.title}`));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', posts => {
                expect(posts.length).to.equal(1);
                expect(posts[0]).to.deep.equal(expectedPost);
            });
            return chakram.wait();
        });
    });

    describe('Updated', () => {
        const changedPost = input[2];
        it('should update existing post with given data', () => {
            const response = chakram.put(api.url('posts/75'), {
                title: changedPost.title,
                body: changedPost.body,
                userId: changedPost.userId
            });
            expect(response).to.have.status(200);
            return response.then(() => {
                const updatedPost = chakram.get(api.url('posts/75'));
                expect(updatedPost).to.have.json('data', newPost => {
                    expect(newPost.title).to.eql(changedPost.title);
                    expect(newPost.body).to.eql(changedPost.body);
                    expect(newPost.userId).to.eql(changedPost.userId);
                });
                return chakram.wait();
            });
        });
        it('should throw error if the post does not exist', () => {
            const response = chakram.put(api.url('posts/203'), {
                title: changedPost.title,
                body: changedPost.body,
                userId: changedPost.userId
            });
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });

    describe('Delete', () => {
        it('should delete post by ID', () => {
            const response = chakram.delete(api.url('posts/23'));
            expect(response).to.have.status(200);
            return response.then(() => {
                const deletedPost = chakram.get(api.url('posts/23'));
                expect(deletedPost).to.have.status(404);
                return chakram.wait();
            });
        });
        it('should throw error if the post does not exist', () => {
            const response = chakram.delete(api.url('posts/203'));
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });
});