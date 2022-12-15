package org.tt.field.controllers.front;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "")
public class GeneralController {
    private static Logger logger = LoggerFactory.getLogger(GeneralController.class);

    @GetMapping("")
    public ModelAndView index(final HttpServletRequest request) {
        logger.info("INDEX");

        ModelAndView mav = new ModelAndView();
        mav.setViewName("base");
        mav.addObject("pageContext", "index");

        return mav;
    }

    @RequestMapping("/none")
    public ModelAndView base(final HttpServletRequest request) {
        logger.info("BASE");

        ModelAndView mav = new ModelAndView();
        mav.setViewName("base");
        mav.addObject("pageContext", "none");

        return mav;
    }
}
