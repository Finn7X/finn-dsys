'use client';

import React, { useState } from 'react';
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Github, Twitter, Mail, Menu, X} from "lucide-react";

const HomePage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const recentPosts = [
        {
            title: "Getting Started with Next.js",
            excerpt: "Learn how to build modern web applications with Next.js",
            date: "2025-02-20",
            readTime: "5 min"
        },
        {
            title: "The Power of Tailwind CSS",
            excerpt: "Why Tailwind CSS is becoming the go-to styling solution",
            date: "2025-02-18",
            readTime: "4 min"
        },
        {
            title: "Building with shadcn/ui",
            excerpt: "Create beautiful interfaces with shadcn/ui components",
            date: "2025-02-15",
            readTime: "6 min"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img
                            src="/favicon.svg"
                            alt="Finn Days Logo"
                            className="w-8 h-8"
                        />
                        <h1 className="text-xl font-bold">Finn Days</h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-6">
                        <Button variant="ghost">Blog</Button>
                        <Button variant="ghost">Projects</Button>
                        <Button variant="ghost">About</Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={toggleMobileMenu}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-3 px-4 bg-white border-b">
                        <div className="flex flex-col space-y-2">
                            <Button variant="ghost" className="justify-start">Blog</Button>
                            <Button variant="ghost" className="justify-start">Projects</Button>
                            <Button variant="ghost" className="justify-start">About</Button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Welcome to Finn Days
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Exploring technology, sharing knowledge, and documenting my journey in web development
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button className="gap-2">
                            <Mail size={18}/>
                            Subscribe
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Github size={18}/>
                            GitHub
                        </Button>
                    </div>
                </div>
            </section>

            {/* Recent Posts */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recentPosts.map((post, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                        <span>{post.date}</span>
                                        <span>{post.readTime} read</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                                    <p className="text-gray-600">{post.excerpt}</p>
                                    <Button variant="link" className="mt-4 px-0">
                                        Read more →
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Skills/Interest Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-bold mb-8">What I Do</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="p-6">
                            <div className="text-purple-600 mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Web Development</h3>
                            <p className="text-gray-600">Building modern web applications with React and Next.js</p>
                        </div>
                        <div className="p-6">
                            <div className="text-blue-600 mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Technical Writing</h3>
                            <p className="text-gray-600">Sharing knowledge through detailed tutorials and articles</p>
                        </div>
                        <div className="p-6">
                            <div className="text-green-600 mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Open Source</h3>
                            <p className="text-gray-600">Contributing to and creating open source projects</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 py-12 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="flex justify-center space-x-6 mb-6">
                        <Button variant="ghost" size="icon">
                            <Github size={20}/>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Twitter size={20}/>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Mail size={20}/>
                        </Button>
                    </div>
                    <p className="text-gray-600">
                        © 2025 Finn Days. Built with Next.js and Tailwind CSS.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;