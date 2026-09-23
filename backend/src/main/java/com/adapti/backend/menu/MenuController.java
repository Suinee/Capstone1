package com.adapti.backend.menu;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MenuController {

    private final MenuRepository menuRepository;

    @GetMapping
    public List<Menu> getMenus() {
        return menuRepository.findByIsActiveTrue();
    }
}